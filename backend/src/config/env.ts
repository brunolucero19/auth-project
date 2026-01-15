import dotenv from 'dotenv';
import path from 'path';

// Calculate path to .env file (backend root)
const envPath = path.resolve(__dirname, '../../.env');

let result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('[Config] Error loading .env from path, trying default location...', result.error);
  result = dotenv.config(); // Try default location (CWD)
}

if (result.error) {
  console.error('[Config] Error loading .env:', result.error);
}

export const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

if (!process.env.DATABASE_URL) {
  console.error('[Config] CRITICAL: DATABASE_URL is undefined!');
}
