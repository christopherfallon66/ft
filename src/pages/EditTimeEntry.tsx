import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { updateTimeEntry } from '../hooks/useTimeEntries';
import CategoryGrid from '../components/CategoryGrid';
import type { TimeCategory, LocationType } from '../types';
import type { TimeCategoryInfo } from '../utils/categories';

export default function EditTimeEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = useLiveQuery(() => (id ? db.timeEntries.get(id) : undefined), [id]);

  const [date, setDate] = useState('');
  const [category, setCategory] = useState<TimeCategory | null>(null);
  const [locationType, setLocationType] = useState<LocationType>('remote');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (entry && !loaded) {
      setDate(entry.date);
      setCategory(entry.category);
      setLocationType(entry.locationType);
      setHours(Math.floor(entry.durationMinutes / 60));
      setMinutes(entry.durationMinutes % 60);
      setNotes(entry.notes);
      setLoaded(true);
    }
  }, [entry, loaded]);

  if (!entry) {
    return <p className="text-center text-text-muted py-8">Loading...</p>;
  }

  const handleCategorySelect = (cat: TimeCategoryInfo) => {
    setCategory(cat.key);
    setLocationType(cat.defaultLocationType);
  };

  const duration = hours * 60 + minutes;
  const canSave = category && duration > 0;

  const stepMinutes = (delta: number) => {
    let total = hours * 60 + minutes + delta;
    if (total < 0) total = 0;
    if (total > 24 * 60) total = 24 * 60;
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
  };

  const handleSave = async () => {
    if (!canSave || !id) return;
    await updateTimeEntry(id, {
      date,
      category: category!,
      locationType,
      durationMinutes: duration,
      notes,
    });
    navigate('/history');
  };

  return (
    <div className="space-y-5 pb-4">
      <h2 className="text-lg font-semibold text-text-light">Edit Time Entry</h2>

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
        <CategoryGrid selected={category} onSelect={handleCategorySelect} />
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Duration</label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => stepMinutes(-15)}
            className="w-10 h-10 rounded-lg bg-forest-deep text-text-light text-xl font-bold flex items-center justify-center active:scale-95"
          >
            -
          </button>
          <div className="text-center min-w-[80px]">
            <span className="font-mono-num text-2xl text-text-light">{hours}h {String(minutes).padStart(2, '0')}m</span>
          </div>
          <button
            onClick={() => stepMinutes(15)}
            className="w-10 h-10 rounded-lg bg-forest-deep text-text-light text-xl font-bold flex items-center justify-center active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Location</label>
        <div className="flex gap-2">
          {(['on_site', 'remote', 'travel'] as LocationType[]).map(loc => (
            <button
              key={loc}
              onClick={() => setLocationType(loc)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] capitalize ${
                locationType === loc
                  ? 'bg-gold text-forest-deep'
                  : 'bg-forest-deep text-text-muted'
              }`}
            >
              {loc.replace('_', '-')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full bg-forest-deep text-text-light text-sm rounded-xl px-4 py-3 placeholder-text-muted/50 resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
          rows={2}
        />
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
              ? 'bg-gold text-forest-deep active:scale-[0.97]'
              : 'bg-forest-deep text-text-muted cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
