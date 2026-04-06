import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import { addTimeEntry } from '../hooks/useTimeEntries';
import { todayString } from '../utils/formatting';
import type { TimeCategory, LocationType } from '../types';
import type { TimeCategoryInfo } from '../utils/categories';

export default function LogTime() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayString());
  const [category, setCategory] = useState<TimeCategory | null>(null);
  const [locationType, setLocationType] = useState<LocationType>('remote');
  const [mode, setMode] = useState<'duration' | 'startend'>('duration');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const handleCategorySelect = (cat: TimeCategoryInfo) => {
    setCategory(cat.key);
    setLocationType(cat.defaultLocationType);
  };

  const computedDuration = mode === 'duration'
    ? hours * 60 + minutes
    : (() => {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
      })();

  const canSave = category && computedDuration > 0;

  const handleSave = async () => {
    if (!canSave) return;
    await addTimeEntry({
      date,
      durationMinutes: computedDuration,
      category: category!,
      locationType,
      notes,
      startTime: mode === 'startend' ? `${date}T${startTime}:00` : null,
      endTime: mode === 'startend' ? `${date}T${endTime}:00` : null,
    });
    navigate('/');
  };

  const stepMinutes = (delta: number) => {
    let total = hours * 60 + minutes + delta;
    if (total < 0) total = 0;
    if (total > 24 * 60) total = 24 * 60;
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
  };

  return (
    <div className="space-y-5 pb-4">
      <h2 className="text-lg font-semibold text-text-light">Log Time</h2>

      {/* Date */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-text-muted block mb-1">Category</label>
        <CategoryGrid selected={category} onSelect={handleCategorySelect} />
      </div>

      {/* Duration mode toggle */}
      <div>
        <div className="flex bg-forest-deep rounded-xl p-1 mb-3">
          <button
            onClick={() => setMode('duration')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'duration' ? 'bg-gold text-forest-deep' : 'text-text-muted'
            }`}
          >
            Duration
          </button>
          <button
            onClick={() => setMode('startend')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'startend' ? 'bg-gold text-forest-deep' : 'text-text-muted'
            }`}
          >
            Start / End
          </button>
        </div>

        {mode === 'duration' ? (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
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
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50"
              />
            </div>
            <span className="text-text-muted mt-5">to</span>
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-forest-deep text-text-light rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold/50"
              />
            </div>
          </div>
        )}

        {computedDuration > 0 && (
          <p className="text-center text-sm text-teal mt-2 font-mono-num">
            {Math.floor(computedDuration / 60)}h {String(computedDuration % 60).padStart(2, '0')}m
          </p>
        )}
      </div>

      {/* Location type */}
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

      {/* Notes */}
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

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all min-h-[44px] ${
          canSave
            ? 'bg-gold text-forest-deep active:scale-[0.97]'
            : 'bg-forest-deep text-text-muted cursor-not-allowed'
        }`}
      >
        Save Entry
      </button>
    </div>
  );
}
