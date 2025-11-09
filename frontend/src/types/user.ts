export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  user_type: string;
  points_balance?: number;
  keys_balance?: number;
  gems_balance?: number;
  created_at?: string;
  updated_at?: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
