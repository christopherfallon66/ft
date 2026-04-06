export type LocationType = 'on_site' | 'remote' | 'travel';

export type TimeCategory =
  | 'onsite_tour'
  | 'onsite_meeting'
  | 'onsite_observation'
  | 'onsite_orientation'
  | 'onsite_other'
  | 'remote_analysis'
  | 'remote_call'
  | 'remote_research'
  | 'remote_meeting'
  | 'remote_other'
  | 'travel_train'
  | 'travel_drive'
  | 'travel_other';

export type ExpenseCategory =
  | 'travel_train'
  | 'travel_fuel'
  | 'travel_rideshare'
  | 'travel_other'
  | 'parking'
  | 'food'
  | 'lodging'
  | 'other';

export type ReimbursementStatus = 'pending' | 'submitted' | 'approved' | 'denied' | 'na';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  monthlyHourAllotment: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  category: TimeCategory;
  locationType: LocationType;
  notes: string;
  isTimerBased: boolean;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  receiptPhotoUri: string | null;
  receiptBlob: Blob | null;
  mileage: number | null;
  mileageRate: number | null;
  mileageAmount: number | null;
  reimbursementStatus: ReimbursementStatus;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveTimer {
  id: string;
  userId: string;
  category: TimeCategory;
  locationType: LocationType;
  startedAt: string;
  lastCheckpoint: string;
  accumulatedSeconds: number;
  notes: string;
  isPaused: boolean;
  pausedAt: string | null;
}

export interface AppConfig {
  key: string;
  value: string;
}
