export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  user_type: string;
  points_balance: number;
  keys_balance: number;
  gems_balance: number;
  gold_collected: number;
  user_tier: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}
