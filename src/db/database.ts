import Dexie, { type EntityTable } from 'dexie';
import type { User, TimeEntry, Expense, ActiveTimer, AppConfig } from '../types';

const db = new Dexie('FallonTracker') as Dexie & {
  users: EntityTable<User, 'id'>;
  timeEntries: EntityTable<TimeEntry, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  activeTimer: EntityTable<ActiveTimer, 'id'>;
  appConfig: EntityTable<AppConfig, 'key'>;
};

db.version(1).stores({
  users: 'id, email',
  timeEntries: 'id, userId, date, category, synced, [userId+date]',
  expenses: 'id, userId, date, category, synced, [userId+date]',
  activeTimer: 'id, userId',
  appConfig: 'key',
});

export { db };

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function seedDatabase() {
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.add({
      id: DEFAULT_USER_ID,
      name: 'Christopher Fallon',
      email: 'cfallon@ebcgroup.com',
      role: 'Senior Expert',
      organization: 'EB&C',
      monthlyHourAllotment: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const configCount = await db.appConfig.count();
  if (configCount === 0) {
    await db.appConfig.bulkAdd([
      { key: 'irs_mileage_rate', value: '0.70' },
      { key: 'monthly_allotment_hours', value: '90' },
    ]);
  }
}
