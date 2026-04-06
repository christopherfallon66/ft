import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_USER_ID } from '../db/database';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRecentTimeEntries } from '../hooks/useTimeEntries';
import { useRecentExpenses } from '../hooks/useExpenses';
import HoursGauge from '../components/HoursGauge';
import { formatDuration, formatCurrency, formatDate } from '../utils/formatting';
import { getTimeCategoryInfo, getExpenseCategoryInfo } from '../utils/categories';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useLiveQuery(() => db.users.get(DEFAULT_USER_ID));
  const allotment = user?.monthlyHourAllotment ?? 90;
  const data = useDashboardData();
  const recentTime = useRecentTimeEntries(5);
  const recentExpenses = useRecentExpenses(5);

  const totalLocationMinutes = data.onsiteMinutes + data.remoteMinutes + data.travelMinutes;

  // Merge and sort recent entries
  const recentItems = [
    ...recentTime.map(e => ({
      id: e.id,
      type: 'time' as const,
      date: e.date,
      label: getTimeCategoryInfo(e.category).label,
      icon: getTimeCategoryInfo(e.category).icon,
      value: formatDuration(e.durationMinutes),
      notes: e.notes,
    })),
    ...recentExpenses.map(e => ({
      id: e.id,
      type: 'expense' as const,
      date: e.date,
      label: getExpenseCategoryInfo(e.category).label,
      icon: getExpenseCategoryInfo(e.category).icon,
      value: formatCurrency(e.amount),
      notes: e.description || e.vendor,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-4">
      {/* Month label */}
      <p className="text-center text-sm text-text-muted">
        {new Date(data.month + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>

      {/* Hours Gauge */}
      <HoursGauge hoursUsed={data.totalHours} allotment={allotment} />

      {/* Pace indicator */}
      <p className="text-center text-xs text-text-muted">
        {data.workdaysRemaining > 0
          ? `${(allotment - data.totalHours).toFixed(1)} hrs remaining, ${data.workdaysRemaining} workdays left`
          : 'Month complete'}
      </p>

      {/* Location split bar */}
      {totalLocationMinutes > 0 && (
        <div className="space-y-1">
          <div className="flex h-3 rounded-full overflow-hidden bg-forest-deep">
            {data.onsiteMinutes > 0 && (
              <div
                className="bg-gold transition-all"
                style={{ width: `${(data.onsiteMinutes / totalLocationMinutes) * 100}%` }}
              />
            )}
            {data.remoteMinutes > 0 && (
              <div
                className="bg-teal transition-all"
                style={{ width: `${(data.remoteMinutes / totalLocationMinutes) * 100}%` }}
              />
            )}
            {data.travelMinutes > 0 && (
              <div
                className="bg-coral transition-all"
                style={{ width: `${(data.travelMinutes / totalLocationMinutes) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" /> On-Site {formatDuration(data.onsiteMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal inline-block" /> Remote {formatDuration(data.remoteMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-coral inline-block" /> Travel {formatDuration(data.travelMinutes)}
            </span>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/timer')}
          className="bg-gold text-forest-deep font-semibold py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Start Timer
        </button>
        <button
          onClick={() => navigate('/log-time')}
          className="border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Log Time
        </button>
        <button
          onClick={() => navigate('/add-expense')}
          className="border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Add Expense
        </button>
      </div>

      {/* Recent activity */}
      {recentItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-2">Recent Activity</h2>
          <div className="space-y-2">
            {recentItems.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(item.type === 'time' ? `/edit-time/${item.id}` : `/edit-expense/${item.id}`)}
                className="bg-forest-deep rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer active:opacity-80"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-text-light truncate">{item.label}</span>
                    <span className="font-mono-num text-sm text-gold ml-2 shrink-0">{item.value}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-text-muted truncate mt-0.5">{item.notes}</p>
                  )}
                </div>
                <span className="text-[10px] text-text-muted shrink-0">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense summary */}
      {data.totalExpenses > 0 && (
        <div
          className="bg-forest-deep rounded-xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => navigate('/history')}
        >
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-sm font-semibold text-text-muted">Expenses This Month</h2>
            <span className="font-mono-num text-lg font-bold text-teal">
              {formatCurrency(data.totalExpenses)}
            </span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(data.expensesByCategory).map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-20 truncate">
                  {getExpenseCategoryInfo(cat as any).label}
                </span>
                <div className="flex-1 h-2 bg-forest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full"
                    style={{ width: `${(amount / data.totalExpenses) * 100}%` }}
                  />
                </div>
                <span className="font-mono-num text-xs text-text-muted w-16 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
