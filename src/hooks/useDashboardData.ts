import { useTimeEntries } from './useTimeEntries';
import { useExpenses } from './useExpenses';
import { currentMonthString, getWorkdaysRemaining } from '../utils/formatting';

export function useDashboardData(month?: string) {
  const m = month ?? currentMonthString();
  const timeEntries = useTimeEntries(m);
  const expenses = useExpenses(m);

  const totalMinutes = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalHours = totalMinutes / 60;

  const onsiteMinutes = timeEntries
    .filter(e => e.locationType === 'on_site')
    .reduce((sum, e) => sum + e.durationMinutes, 0);
  const remoteMinutes = timeEntries
    .filter(e => e.locationType === 'remote')
    .reduce((sum, e) => sum + e.durationMinutes, 0);
  const travelMinutes = timeEntries
    .filter(e => e.locationType === 'travel')
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const workdaysRemaining = getWorkdaysRemaining(m);

  return {
    month: m,
    totalHours,
    totalMinutes,
    onsiteMinutes,
    remoteMinutes,
    travelMinutes,
    totalExpenses,
    expensesByCategory,
    workdaysRemaining,
    timeEntries,
    expenses,
  };
}
