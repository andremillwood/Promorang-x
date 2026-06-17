type LoginResult = {
  user: {
    id: string;
    email: string;
    username?: string;
    display_name?: string;
    user_type?: string;
    points_balance?: number;
    keys_balance?: number;
    gems_balance?: number;
    email_verified?: boolean;
  };
  token: string;
  refreshToken: string;
};

export const authService = {
  async login(email: string, _password: string): Promise<LoginResult> {
    throw new Error(`Legacy TypeScript auth route is not configured for ${email}`);
  },

  async logout(_refreshToken: string): Promise<void> {
    return undefined;
  },
};
