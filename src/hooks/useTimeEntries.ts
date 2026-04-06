import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_USER_ID } from '../db/database';
import type { TimeEntry, TimeCategory, LocationType } from '../types';

export function useTimeEntries(month: string) {
  const entries = useLiveQuery(
    () => {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      return db.timeEntries
        .where('date')
        .between(startDate, endDate, true, true)
        .and(e => e.userId === DEFAULT_USER_ID)
        .toArray();
    },
    [month],
    []
  );

  return entries;
}

export function useRecentTimeEntries(limit = 5) {
  return useLiveQuery(
    () =>
      db.timeEntries
        .where('userId')
        .equals(DEFAULT_USER_ID)
        .reverse()
        .sortBy('date')
        .then(arr => arr.slice(0, limit)),
    [limit],
    []
  );
}

export async function addTimeEntry(entry: {
  date: string;
  durationMinutes: number;
  category: TimeCategory;
  locationType: LocationType;
  notes?: string;
  startTime?: string | null;
  endTime?: string | null;
  isTimerBased?: boolean;
}) {
  const now = new Date().toISOString();
  const record: TimeEntry = {
    id: crypto.randomUUID(),
    userId: DEFAULT_USER_ID,
    date: entry.date,
    startTime: entry.startTime ?? null,
    endTime: entry.endTime ?? null,
    durationMinutes: entry.durationMinutes,
    category: entry.category,
    locationType: entry.locationType,
    notes: entry.notes ?? '',
    isTimerBased: entry.isTimerBased ?? false,
    synced: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.timeEntries.add(record);
  return record;
}

export async function updateTimeEntry(id: string, changes: Partial<TimeEntry>) {
  await db.timeEntries.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function deleteTimeEntry(id: string) {
  await db.timeEntries.delete(id);
}
