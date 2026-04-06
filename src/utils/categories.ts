import type { TimeCategory, ExpenseCategory, LocationType } from '../types';

export interface TimeCategoryInfo {
  key: TimeCategory;
  label: string;
  defaultLocationType: LocationType;
  group: 'On-Site' | 'Remote' | 'Travel';
  icon: string;
}

export interface ExpenseCategoryInfo {
  key: ExpenseCategory;
  label: string;
  icon: string;
}

export const TIME_CATEGORIES: TimeCategoryInfo[] = [
  { key: 'onsite_tour', label: 'Tour / Walkthrough', defaultLocationType: 'on_site', group: 'On-Site', icon: '🏢' },
  { key: 'onsite_meeting', label: 'Meeting (On-Site)', defaultLocationType: 'on_site', group: 'On-Site', icon: '🤝' },
  { key: 'onsite_observation', label: 'Observation', defaultLocationType: 'on_site', group: 'On-Site', icon: '👁' },
  { key: 'onsite_orientation', label: 'Training / Orientation', defaultLocationType: 'on_site', group: 'On-Site', icon: '📋' },
  { key: 'onsite_other', label: 'Other (On-Site)', defaultLocationType: 'on_site', group: 'On-Site', icon: '📌' },
  { key: 'remote_analysis', label: 'Analysis / Writing', defaultLocationType: 'remote', group: 'Remote', icon: '📝' },
  { key: 'remote_call', label: 'Phone / Video Call', defaultLocationType: 'remote', group: 'Remote', icon: '📞' },
  { key: 'remote_research', label: 'Research / Doc Review', defaultLocationType: 'remote', group: 'Remote', icon: '🔍' },
  { key: 'remote_meeting', label: 'Meeting (Remote)', defaultLocationType: 'remote', group: 'Remote', icon: '💻' },
  { key: 'remote_other', label: 'Other (Remote)', defaultLocationType: 'remote', group: 'Remote', icon: '📎' },
  { key: 'travel_train', label: 'Travel (Train)', defaultLocationType: 'travel', group: 'Travel', icon: '🚂' },
  { key: 'travel_drive', label: 'Travel (Driving)', defaultLocationType: 'travel', group: 'Travel', icon: '🚗' },
  { key: 'travel_other', label: 'Travel (Other)', defaultLocationType: 'travel', group: 'Travel', icon: '✈️' },
];

export const EXPENSE_CATEGORIES: ExpenseCategoryInfo[] = [
  { key: 'travel_train', label: 'Train / Bus', icon: '🚂' },
  { key: 'travel_fuel', label: 'Fuel / Tolls', icon: '⛽' },
  { key: 'travel_rideshare', label: 'Rideshare / Taxi', icon: '🚕' },
  { key: 'travel_other', label: 'Travel (Other)', icon: '✈️' },
  { key: 'parking', label: 'Parking', icon: '🅿️' },
  { key: 'food', label: 'Food / Meals', icon: '🍽' },
  { key: 'lodging', label: 'Lodging', icon: '🏨' },
  { key: 'other', label: 'Other', icon: '📦' },
];

export function getTimeCategoryInfo(key: TimeCategory): TimeCategoryInfo {
  return TIME_CATEGORIES.find(c => c.key === key)!;
}

export function getExpenseCategoryInfo(key: ExpenseCategory): ExpenseCategoryInfo {
  return EXPENSE_CATEGORIES.find(c => c.key === key)!;
}

export function getTimeCategoryGroups(): { group: string; categories: TimeCategoryInfo[] }[] {
  const groups: { group: string; categories: TimeCategoryInfo[] }[] = [];
  for (const cat of TIME_CATEGORIES) {
    let g = groups.find(g => g.group === cat.group);
    if (!g) {
      g = { group: cat.group, categories: [] };
      groups.push(g);
    }
    g.categories.push(cat);
  }
  return groups;
}
