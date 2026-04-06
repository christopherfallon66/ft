import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_USER_ID } from '../db/database';
import type { Expense, ExpenseCategory, ReimbursementStatus } from '../types';

export function useExpenses(month: string) {
  const expenses = useLiveQuery(
    () => {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      return db.expenses
        .where('date')
        .between(startDate, endDate, true, true)
        .and(e => e.userId === DEFAULT_USER_ID)
        .toArray();
    },
    [month],
    []
  );

  return expenses;
}

export function useRecentExpenses(limit = 5) {
  return useLiveQuery(
    () =>
      db.expenses
        .where('userId')
        .equals(DEFAULT_USER_ID)
        .reverse()
        .sortBy('date')
        .then(arr => arr.slice(0, limit)),
    [limit],
    []
  );
}

export async function addExpense(entry: {
  date: string;
  amount: number;
  category: ExpenseCategory;
  vendor?: string;
  description?: string;
  receiptBlob?: Blob | null;
  mileage?: number | null;
  mileageRate?: number | null;
  mileageAmount?: number | null;
  reimbursementStatus?: ReimbursementStatus;
}) {
  const now = new Date().toISOString();
  const record: Expense = {
    id: crypto.randomUUID(),
    userId: DEFAULT_USER_ID,
    date: entry.date,
    amount: entry.amount,
    category: entry.category,
    vendor: entry.vendor ?? '',
    description: entry.description ?? '',
    receiptPhotoUri: null,
    receiptBlob: entry.receiptBlob ?? null,
    mileage: entry.mileage ?? null,
    mileageRate: entry.mileageRate ?? null,
    mileageAmount: entry.mileageAmount ?? null,
    reimbursementStatus: entry.reimbursementStatus ?? 'na',
    synced: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.expenses.add(record);
  return record;
}

export async function updateExpense(id: string, changes: Partial<Expense>) {
  await db.expenses.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function deleteExpense(id: string) {
  await db.expenses.delete(id);
}
