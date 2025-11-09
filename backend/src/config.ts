export interface Config {
  supabaseUrl: string;
  supabaseServiceKey: string;
  jwtSecret: string;
  nodeEnv: 'development' | 'production';
  port: number;
  frontendUrl: string;
  apiUrl: string;
}

// Validate required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

for (const envVar of requiredVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

export const config: Config = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
  nodeEnv: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`,
};

console.log('✅ Environment variables loaded successfully');
