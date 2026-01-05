import { db } from '../db';
import { generateToken, verifyPassword, hashPassword, generateRefreshToken } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { HonoRequest } from 'hono';

export interface UserInput {
  email: string;
  password: string;
  username: string;
  display_name?: string;
  user_type?: string;
}

export const authService = {
  async register(userData: UserInput) {
    const { email, password, username, display_name, user_type = 'user' } = userData;

    // Check if user already exists
    const { data: existingUser } = await db.users()
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const verificationToken = uuidv4();

    // Create new user
    const { data: user, error } = await db.users().insert({
      email,
      username,
      display_name: display_name || username,
      user_type,
      password_hash: passwordHash,
      verification_token: verificationToken,
      email_verified: false,
      points_balance: 100, // Starting points
      keys_balance: 5,     // Starting keys
      gems_balance: 10     // Starting gems
    }).select().single();

    if (error) throw new Error(error.message);
    if (!user) throw new Error('Failed to create user');

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return { user, token };
  },

  async login(email: string, password: string) {
    console.log('AuthService - Login attempt for email:', email);
    
    // Find user by email
    const { data: user, error } = await db.users()
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Database error when finding user:', error);
      throw new Error('Error finding user');
    }

    if (!user) {
      console.log('No user found with email:', email);
      throw new Error('Invalid email or password');
    }

    console.log('User found, verifying password...');
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      console.log('Invalid password for user:', email);
      throw new Error('Invalid email or password');
    }

    // Generate access token
    const accessToken = generateToken({
      userId: user.id,
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name,
      user_type: user.user_type,
      role: user.user_type,
      advertiser_tier: (user as any).advertiser_tier ?? null
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    // Store refresh token in database
    await db.refresh_tokens().insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = user;

    return { 
      user: userWithoutPassword, 
      token: accessToken,
      refreshToken
    };
  },

  async refreshTokens(refreshToken: string) {
    // Verify refresh token
    const { data: tokenData, error: tokenError } = await db.refresh_tokens()
      .select('*')
      .eq('token', refreshToken)
      .single();

    if (tokenError || !tokenData || new Date(tokenData.expires_at) < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user data
    const { data: user, error: userError } = await db.users()
      .select('*')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const newAccessToken = generateToken({
      userId: user.id,
      email: user.email
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id
    });

    // Update refresh token in database
    await db.refresh_tokens()
      .update({ 
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
      .eq('id', tokenData.id);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        email_verified: user.email_verified
      }
    };
  },

  async logout(refreshToken: string) {
    // Delete refresh token
    await db.refresh_tokens()
      .delete()
      .eq('token', refreshToken);
  },

  async requestPasswordReset(email: string) {
    const { data: user, error } = await db.users()
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if user exists or not
      return { success: true };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await db.password_resets().upsert({
      email,
      token: resetToken,
      expires_at: expiresAt
    });

    // In a real app, you would send an email with the reset link
    // For now, we'll just log it
    console.log(`Password reset link: /reset-password?token=${resetToken}`);

    return { success: true };
  },

  async resetPassword(token: string, newPassword: string) {
    // Find valid reset token
    const { data: reset, error } = await db.password_resets()
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !reset) {
      throw new Error('Invalid or expired reset token');
    }

    // Update user's password
    const passwordHash = await hashPassword(newPassword);
    await db.users()
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('email', reset.email);

    // Delete all reset tokens for this email
    await db.password_resets()
      .delete()
      .eq('email', reset.email);

    return { success: true };
  },

  async updateUser(userId: string, updateData: Partial<UserInput>) {
    const updates: Record<string, any> = { ...updateData };
    
    // If password is being updated, hash it
    if (updates.password) {
      updates.password_hash = await hashPassword(updates.password);
      delete updates.password;
    }

    // Update user
    const { data: user, error } = await db.users()
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update user');
    }

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async getCurrentUser(userId: string) {
    const { data: user, error } = await db.users()
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
