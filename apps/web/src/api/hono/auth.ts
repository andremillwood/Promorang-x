import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { sign, verify } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { cors } from 'hono/cors';
import * as bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  display_name: z.string().min(2),
});

const loginSchema = signupSchema.pick({ email: true, password: true });

const generateToken = (userId: string) => {
  return sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

const app = new Hono();

app.use('*', cors());

app.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { email, password, username, display_name } = c.req.valid('json');
  
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        username, 
        display_name,
        password_hash,
        user_type: 'standard',
        points_balance: 0,
        keys_balance: 0,
        gems_balance: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(user.id);

    return c.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user.id);

    return c.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/api/me', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as { sub: string };
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, user_type')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
