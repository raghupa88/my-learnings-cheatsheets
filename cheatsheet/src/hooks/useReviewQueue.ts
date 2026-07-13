import { useMemo } from 'react';
import { useProgressStore, type Confidence } from './useProgress';

// Days before a topic is due again, per confidence level
const INTERVAL_DAYS: Record<Confidence, number> = {
  0: 0,   // not started — never due
  1: 1,
  2: 3,
  3: 14,
};

export interface QueueEntry {
  key: string;
  confidence: Confidence;
  updatedAt: string;
  daysUntilDue: number; // negative = overdue
  dueLabel: string;
}

function buildDueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `due in ${days}d`;
}

function shortTitle(key: string): string {
  const parts = key.split('/');
  return parts[parts.length - 1];
}

function routeLabel(key: string): string {
  return key.split('/')[0] ?? '';
}

export interface ReviewQueue {
  due: QueueEntry[];       // daysUntilDue <= 0
  upcoming: QueueEntry[];  // 0 < daysUntilDue <= 7
}

export function useReviewQueue(): ReviewQueue {
  const store = useProgressStore();

  return useMemo(() => {
    const now = Date.now();
    const due: QueueEntry[] = [];
    const upcoming: QueueEntry[] = [];

    for (const [key, entry] of Object.entries(store)) {
      const confidence = entry.confidence as Confidence;
      if (confidence === 0 || !entry.updatedAt) continue;

      const intervalMs = INTERVAL_DAYS[confidence] * 86_400_000;
      const dueMs = new Date(entry.updatedAt).getTime() + intervalMs;
      const daysUntilDue = Math.ceil((dueMs - now) / 86_400_000);

      const item: QueueEntry = {
        key,
        confidence,
        updatedAt: entry.updatedAt,
        daysUntilDue,
        dueLabel: buildDueLabel(daysUntilDue),
      };

      if (daysUntilDue <= 0) {
        due.push(item);
      } else if (daysUntilDue <= 7) {
        upcoming.push(item);
      }
    }

    // Due: most overdue first
    due.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    // Upcoming: soonest first
    upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return { due, upcoming };
  }, [store]);
}

export { shortTitle, routeLabel };
