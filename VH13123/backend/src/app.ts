import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import { requestLogger } from './middleware/log.middleware';
import notificationRoutes from './routes/notification.routes';
import logRoutes from './routes/log.routes';
import { Log } from './services/log.service';

const app = express();

// 1. Logging routes mapping start
Log('backend', 'info', 'config', 'Initializing Express application middleware pipeline');

// 2. Standard Middleware
app.use(cors()); // Allow cross-origin requests from frontend (localhost:3000)
app.use(compression()); // Compress responses for optimization (Gzip/Brotli)
app.use(express.json()); // Parse incoming JSON payloads

// 3. Custom Request/Response Logging Middleware
app.use(requestLogger);

// 4. Mount API Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/logs', logRoutes);

// 5. Health Check / Metadata Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  Log('backend', 'debug', 'route', 'Health check endpoint triggered');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Notification Management Backend',
    environment: {
      port: process.env.PORT || 5000,
      tokenConfigured: !!process.env.ACCESS_TOKEN
    }
  });
});

// 6. Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  const message = err.message || 'Unknown server error';
  Log('backend', 'error', 'middleware', `Unhandled error occurred: ${message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred'
  });
});

export default app;
