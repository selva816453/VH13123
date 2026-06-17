import app from './app';
import { config } from './config';
import { Log } from './services/log.service';

const server = app.listen(config.port, () => {
  Log(
    'backend',
    'info',
    'config',
    `Notification System Backend started successfully on port ${config.port} (http://localhost:${config.port})`
  );
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => {
  Log('backend', 'warn', 'config', 'SIGTERM signal received: closing HTTP server');
  server.close(() => {
    Log('backend', 'info', 'config', 'HTTP server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Log('backend', 'warn', 'config', 'SIGINT signal received: closing HTTP server');
  server.close(() => {
    Log('backend', 'info', 'config', 'HTTP server closed gracefully');
    process.exit(0);
  });
});
