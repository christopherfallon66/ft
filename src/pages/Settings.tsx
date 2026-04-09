import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { QRCodeSVG } from 'qrcode.react';
import { db, DEFAULT_USER_ID } from '../db/database';

const APP_URL = 'https://christopherfallon66.github.io/ft/';

export default function Settings() {
  const navigate = useNavigate();
  const user = useLiveQuery(() => db.users.get(DEFAULT_USER_ID));
  const mileageConfig = useLiveQuery(() => db.appConfig.get('irs_mileage_rate'));
  const allotmentConfig = useLiveQuery(() => db.appConfig.get('monthly_allotment_hours'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [allotment, setAllotment] = useState('90');
  const [mileageRate, setMileageRate] = useState('0.70');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setOrganization(user.organization);
    }
    if (allotmentConfig) setAllotment(allotmentConfig.value);
    if (mileageConfig) setMileageRate(mileageConfig.value);
  }, [user?.id, allotmentConfig, mileageConfig]);

  const handleSave = async () => {
    await db.appConfig.put({ key: 'monthly_allotment_hours', value: allotment });
    await db.appConfig.put({ key: 'irs_mileage_rate', value: mileageRate });
    if (user) {
      await db.users.update(DEFAULT_USER_ID, {
        name,
        email,
        role,
        organization,
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
    a.download = `RikersExpertTracker_Backup_${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50";

  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-lg font-semibold text-text-light">Settings</h2>

      {/* Profile */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Profile</h3>
        <div>
          <label className="text-xs text-text-muted block mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Role</label>
          <input type="text" value={role} onChange={e => setRole(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Organization</label>
          <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Allotment & Mileage */}
      <div className="space-y-3 pt-4 border-t border-forest-deep">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Budget</h3>
        <div>
          <label className="text-xs text-text-muted block mb-1">Monthly Hour Allotment</label>
          <input
            type="number"
            value={allotment}
            onChange={e => setAllotment(e.target.value)}
            className={`${inputClass} font-mono-num`}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">IRS Mileage Rate ($/mile)</label>
          <input
            type="number"
            step="0.01"
            value={mileageRate}
            onChange={e => setMileageRate(e.target.value)}
            className={`${inputClass} font-mono-num`}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-gold text-forest-deep font-semibold py-3 rounded-xl active:scale-[0.97] transition-transform min-h-[44px]"
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Data & Help */}
      <div className="space-y-3 pt-4 border-t border-forest-deep">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Data & Help</h3>
        <button
          onClick={handleExport}
          className="w-full border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Export All Data (JSON)
        </button>
        <button
          onClick={() => navigate('/help')}
          className="w-full border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
        >
          How To / FAQ
        </button>
      </div>

      {/* Share */}
      <div className="space-y-3 pt-4 border-t border-forest-deep">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-semibold">Share App</h3>
        <div className="bg-forest-deep rounded-xl p-4 flex flex-col items-center gap-3">
          <QRCodeSVG
            value={APP_URL}
            size={160}
            bgColor="#0A2E22"
            fgColor="#E1F5EE"
            level="M"
          />
          <p className="text-xs text-text-muted text-center">Scan to install Rikers Expert Tracker</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(APP_URL);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-sm text-teal font-medium min-h-[44px] px-4"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted">Rikers Expert Tracker v1.0</p>
    </div>
  );
}
