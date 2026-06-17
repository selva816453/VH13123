import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  accessToken: process.env.ACCESS_TOKEN || 'system-secret-auth-token-12345',
  logFilePath: path.join(__dirname, '../../logs/app.log'),
};
