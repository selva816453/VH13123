import axios from 'axios';
import { Notification, NotificationStats, LogEntry } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
const ACCESS_TOKEN = (import.meta as any).env.VITE_ACCESS_TOKEN || 'system-secret-auth-token-12345';

// Configure standard Axios client
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject Bearer Token for every API call
apiClient.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const NotificationService = {
  /**
   * Fetch paginated notifications list with type and search filters
   */
  async getNotifications(params: {
    page: number;
    limit: number;
    notification_type?: string;
    search?: string;
  }) {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        notifications: Notification[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>('/notifications', { params });
    return response.data.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string) {
    const response = await apiClient.post<{ success: boolean; data: Notification }>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  /**
   * Mark a notification as unread
   */
  async markAsUnread(id: string) {
    const response = await apiClient.post<{ success: boolean; data: Notification }>(
      `/notifications/${id}/unread`
    );
    return response.data.data;
  },

  /**
   * Fetch top 10 prioritized notifications using Max-Heap
   */
  async getPriorityNotifications() {
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
      '/notifications/priority'
    );
    return response.data.data;
  },

  /**
   * Get notification category stats
   */
  async getStats() {
    const response = await apiClient.get<{ success: boolean; data: NotificationStats }>(
      '/notifications/stats'
    );
    return response.data.data;
  }
};

export const LogService = {
  /**
   * Transmit single or bulk logs back to the backend
   */
  async transmitLogs(payload: LogEntry | LogEntry[]) {
    const isArray = Array.isArray(payload);
    const body = isArray ? { logs: payload } : payload;
    const response = await apiClient.post<{ success: boolean }>('/logs', body);
    return response.data.success;
  },

  /**
   * Retrieve centralized logs for the console visualization drawer
   */
  async fetchRecentLogs(limit: number = 50) {
    const response = await apiClient.get<{ success: boolean; data: LogEntry[] }>('/logs', {
      params: { limit }
    });
    return response.data.data;
  }
};
