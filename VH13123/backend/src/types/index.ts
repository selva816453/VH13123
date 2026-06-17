export type NotificationType = 'Event' | 'Result' | 'Placement';

export type NotificationPriority = 1 | 2 | 3; // Event = 1, Result = 2, Placement = 3

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export type LogStack = 'backend' | 'frontend';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

export type FrontendPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

export type CommonPackage = 'auth' | 'config' | 'middleware' | 'utils';

export type LogPackage = BackendPackage | FrontendPackage | CommonPackage;

export interface LogEntry {
  timestamp: string;
  stack: LogStack;
  level: LogLevel;
  packageName: LogPackage;
  message: string;
}
