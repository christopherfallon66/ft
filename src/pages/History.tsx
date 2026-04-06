import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeEntries, deleteTimeEntry } from '../hooks/useTimeEntries';
import { useExpenses, deleteExpense } from '../hooks/useExpenses';
import { currentMonthString, formatDuration, formatCurrency, formatDateFull } from '../utils/formatting';
import { getTimeCategoryInfo, getExpenseCategoryInfo } from '../utils/categories';

type FilterTab = 'all' | 'time' | 'expenses';

export default function History() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthString());
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const timeEntries = useTimeEntries(month);
  const expenses = useExpenses(month);

  const navigateMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = new Date(month + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build unified list
  type Item = { id: string; type: 'time' | 'expense'; date: string; icon: string; label: string; value: string; notes: string; category: string };
  const items: Item[] = [];

  if (filter !== 'expenses') {
    for (const e of timeEntries) {
      const cat = getTimeCategoryInfo(e.category);
      items.push({
        id: e.id, type: 'time', date: e.date,
        icon: cat.icon, label: cat.label,
        value: formatDuration(e.durationMinutes),
        notes: e.notes, category: e.category,
      });
    }
  }
  if (filter !== 'time') {
    for (const e of expenses) {
      const cat = getExpenseCategoryInfo(e.category);
      items.push({
        id: e.id, type: 'expense', date: e.date,
        icon: cat.icon, label: cat.label,
        value: formatCurrency(e.amount),
        notes: e.description || e.vendor, category: e.category,
      });
    }
  }

  items.sort((a, b) => b.date.localeCompare(a.date));

  const totalHours = timeEntries.reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const totalExpenseAmt = expenses.reduce((s, e) => s + e.amount, 0);

  const handleDelete = async (item: Item) => {
    if (item.type === 'time') await deleteTimeEntry(item.id);
    else await deleteExpense(item.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Month picker */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="text-gold text-2xl px-3 py-1 min-h-[44px]">&lt;</button>
        <h2 className="text-base font-semibold text-text-light">{monthLabel}</h2>
        <button onClick={() => navigateMonth(1)} className="text-gold text-2xl px-3 py-1 min-h-[44px]">&gt;</button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-forest-deep rounded-xl p-1">
        {(['all', 'time', 'expenses'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === tab ? 'bg-gold text-forest-deep' : 'text-text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Entries */}
      {items.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8">No entries for this month.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={`${item.type}-${item.id}`} className="bg-forest-deep rounded-xl px-3 py-2.5">
              <div
                className="flex items-center gap-3 cursor-pointer active:opacity-80"
                onClick={() => navigate(item.type === 'time' ? `/edit-time/${item.id}` : `/edit-expense/${item.id}`)}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-text-light truncate">{item.label}</span>
                    <span className={`font-mono-num text-sm ml-2 shrink-0 ${item.type === 'time' ? 'text-gold' : 'text-teal'}`}>
                      {item.value}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    {item.notes && <p className="text-xs text-text-muted truncate">{item.notes}</p>}
                    <span className="text-[10px] text-text-muted shrink-0 ml-2">{formatDateFull(item.date)}</span>
                  </div>
                </div>
              </div>

              {/* Edit / Delete actions */}
              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-forest/50">
                  <span className="text-xs text-red">Delete?</span>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-red font-semibold px-2 py-1 border border-red rounded min-h-[32px]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-xs text-text-muted px-2 py-1 min-h-[32px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => navigate(item.type === 'time' ? `/edit-time/${item.id}` : `/edit-expense/${item.id}`)}
                    className="text-[10px] text-teal hover:text-teal/80 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="text-[10px] text-text-muted hover:text-red transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Running totals */}
      <div className="flex justify-between bg-forest-deep rounded-xl px-4 py-3 text-sm">
        <div>
          <span className="text-text-muted">Hours: </span>
          <span className="font-mono-num text-gold font-semibold">{totalHours.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-text-muted">Expenses: </span>
          <span className="font-mono-num text-teal font-semibold">{formatCurrency(totalExpenseAmt)}</span>
        </div>
      </div>
    </div>
  );
}
