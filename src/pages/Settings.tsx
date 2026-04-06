import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_USER_ID } from '../db/database';

export default function Settings() {
  const user = useLiveQuery(() => db.users.get(DEFAULT_USER_ID));
  const mileageConfig = useLiveQuery(() => db.appConfig.get('irs_mileage_rate'));
  const allotmentConfig = useLiveQuery(() => db.appConfig.get('monthly_allotment_hours'));

  const [allotment, setAllotment] = useState('90');
  const [mileageRate, setMileageRate] = useState('0.70');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (allotmentConfig) setAllotment(allotmentConfig.value);
    if (mileageConfig) setMileageRate(mileageConfig.value);
  }, [allotmentConfig, mileageConfig]);

  const handleSave = async () => {
    await db.appConfig.put({ key: 'monthly_allotment_hours', value: allotment });
    await db.appConfig.put({ key: 'irs_mileage_rate', value: mileageRate });
    if (user) {
      await db.users.update(DEFAULT_USER_ID, {
        monthlyHourAllotment: parseFloat(allotment),
        updatedAt: new Date().toISOString(),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const timeEntries = await db.timeEntries.toArray();
    const expenses = await db.expenses.toArray();
    const data = JSON.stringify({ timeEntries, expenses, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FallonTracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-lg font-semibold text-text-light">Settings</h2>

      {/* Profile */}
      <div className="bg-forest-deep rounded-xl p-4 space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Profile</h3>
        <p className="text-sm text-text-light">{user?.name}</p>
        <p className="text-xs text-text-muted">{user?.role}, {user?.organization}</p>
        <p className="text-xs text-text-muted">{user?.email}</p>
      </div>

      {/* Allotment */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Monthly Hour Allotment</label>
        <input
          type="number"
          value={allotment}
          onChange={e => setAllotment(e.target.value)}
          className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 font-mono-num focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </div>

      {/* Mileage rate */}
      <div>
        <label className="text-xs text-text-muted block mb-1">IRS Mileage Rate ($/mile)</label>
        <input
          type="number"
          step="0.01"
          value={mileageRate}
          onChange={e => setMileageRate(e.target.value)}
          className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 font-mono-num focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-gold text-forest-deep font-semibold py-3 rounded-xl active:scale-[0.97] transition-transform min-h-[44px]"
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Data management */}
      <div className="space-y-3 pt-4 border-t border-forest-deep">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Data</h3>
        <button
          onClick={handleExport}
          className="w-full border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Export All Data (JSON)
        </button>
      </div>

      <p className="text-center text-xs text-text-muted">Fallon Tracker v1.0</p>
    </div>
  );
}
