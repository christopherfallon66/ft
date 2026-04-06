import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { updateExpense } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/formatting';
import { EXPENSE_CATEGORIES, type ExpenseCategoryInfo } from '../utils/categories';
import type { ExpenseCategory, ReimbursementStatus } from '../types';

export default function EditExpense() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = useLiveQuery(() => (id ? db.expenses.get(id) : undefined), [id]);
  const mileageRateConfig = useLiveQuery(() => db.appConfig.get('irs_mileage_rate'));
  const mileageRate = parseFloat(mileageRateConfig?.value ?? '0.70');

  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [useMileage, setUseMileage] = useState(false);
  const [mileage, setMileage] = useState('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [reimbursementStatus, setReimbursementStatus] = useState<ReimbursementStatus>('na');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (entry && !loaded) {
      setDate(entry.date);
      setCategory(entry.category);
      setAmount(String(entry.amount));
      setVendor(entry.vendor);
      setDescription(entry.description);
      setReimbursementStatus(entry.reimbursementStatus);
      if (entry.mileage) {
        setUseMileage(true);
        setMileage(String(entry.mileage));
      }
      setLoaded(true);
    }
  }, [entry, loaded]);

  if (!entry) {
    return <p className="text-center text-text-muted py-8">Loading...</p>;
  }

  const isFuel = category === 'travel_fuel';
  const computedAmount = useMileage && isFuel
    ? parseFloat(mileage || '0') * mileageRate
    : parseFloat(amount || '0');
  const canSave = category && computedAmount > 0;

  const handleCategorySelect = (cat: ExpenseCategoryInfo) => {
    setCategory(cat.key);
    if (cat.key !== 'travel_fuel') setUseMileage(false);
  };

  const handleSave = async () => {
    if (!canSave || !id) return;
    await updateExpense(id, {
      date,
      amount: computedAmount,
      category: category!,
      vendor,
      description,
      mileage: useMileage ? parseFloat(mileage || '0') : null,
      mileageRate: useMileage ? mileageRate : null,
      mileageAmount: useMileage ? computedAmount : null,
      reimbursementStatus,
    });
    navigate('/history');
  };

  return (
    <div className="space-y-5 pb-4">
      <h2 className="text-lg font-semibold text-text-light">Edit Expense</h2>

      <div>
        <label className="text-xs text-text-muted block mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategorySelect(cat)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl text-left text-sm font-medium transition-all min-h-[44px] ${
                category === cat.key
                  ? 'bg-teal text-forest-deep ring-2 ring-teal'
                  : 'bg-forest-deep text-text-light hover:bg-forest-deep/80 active:scale-[0.97]'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {isFuel && (
          <div className="flex bg-forest-deep rounded-xl p-1 mb-3">
            <button
              onClick={() => setUseMileage(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !useMileage ? 'bg-teal text-forest-deep' : 'text-text-muted'
              }`}
            >
              Enter Amount
            </button>
            <button
              onClick={() => setUseMileage(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                useMileage ? 'bg-teal text-forest-deep' : 'text-text-muted'
              }`}
            >
              Log Mileage
            </button>
          </div>
        )}

        {useMileage && isFuel ? (
          <div className="space-y-2">
            <label className="text-xs text-text-muted block">Miles Driven</label>
            <input
              type="number"
              inputMode="decimal"
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder="0"
              className="w-full bg-forest-deep text-text-light text-lg rounded-xl px-4 py-3 font-mono-num focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
            <p className="text-xs text-text-muted">
              Rate: {formatCurrency(mileageRate)}/mile = <span className="text-teal font-mono-num">{formatCurrency(computedAmount)}</span>
            </p>
          </div>
        ) : (
          <div>
            <label className="text-xs text-text-muted block mb-1">Amount (USD)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-forest-deep text-text-light text-lg rounded-xl px-4 py-3 font-mono-num focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Vendor / Description</label>
        <input
          type="text"
          value={vendor}
          onChange={e => setVendor(e.target.value)}
          className="w-full bg-forest-deep text-text-light text-sm rounded-xl px-4 py-3 placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Reimbursement Status</label>
        <select
          value={reimbursementStatus}
          onChange={e => setReimbursementStatus(e.target.value as ReimbursementStatus)}
          className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50"
        >
          <option value="na">N/A</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/history')}
          className="flex-1 border border-text-muted/30 text-text-light font-medium py-4 rounded-xl text-base min-h-[44px]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex-1 py-4 rounded-xl text-base font-semibold transition-all min-h-[44px] ${
            canSave
              ? 'bg-teal text-forest-deep active:scale-[0.97]'
              : 'bg-forest-deep text-text-muted cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
