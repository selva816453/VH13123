import { Notification } from '../types';
import { MaxHeap } from '../utils/priorityQueue';
import { Log } from './log.service';

/**
 * Compare two notifications based on priority weights (Placement=3, Result=2, Event=1)
 * and uses creation timestamp as a tie-breaker (newer timestamp is larger/wins).
 */
export function compareNotifications(a: Notification, b: Notification): number {
  // Primary comparison: Priority Weight
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }

  // Secondary comparison (Tie-Breaker): Creation Time
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  return timeA - timeB;
}

/**
 * Filter and sort notifications in memory to output the top 'limit' notifications
 * using a Max-Heap priority queue structure.
 * Time Complexity: O(N log N) to insert + O(K log N) to extract, where K is limit.
 */
export function getTopNotifications(
  notifications: Notification[],
  limit: number = 10
): Notification[] {
  Log('backend', 'debug', 'service', `Calculating top ${limit} notifications using Heap algorithm`);

  const heap = new MaxHeap<Notification>(compareNotifications);

  // 1. Insert all items into the Max-Heap
  for (const notification of notifications) {
    heap.insert(notification);
  }

  // 2. Extract maximum elements up to the requested limit
  const topNotifications: Notification[] = [];
  const extractCount = Math.min(limit, heap.size());

  for (let i = 0; i < extractCount; i++) {
    const maxItem = heap.extractMax();
    if (maxItem) {
      topNotifications.push(maxItem);
    }
  }

  Log('backend', 'info', 'service', `Heap prioritized ${topNotifications.length} notifications`);
  return topNotifications;
}
