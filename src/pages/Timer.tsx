import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../hooks/useTimer';
import { addTimeEntry } from '../hooks/useTimeEntries';
import CategoryGrid from '../components/CategoryGrid';
import { formatTimerDisplay } from '../utils/formatting';
import { getTimeCategoryInfo, type TimeCategoryInfo } from '../utils/categories';
import { todayString } from '../utils/formatting';

export default function Timer() {
  const navigate = useNavigate();
  const { activeTimer, elapsed, isPaused, start, pause, resume, stop, discard, updateNotes } = useTimer();
  const [showDiscard, setShowDiscard] = useState(false);

  const handleCategorySelect = async (cat: TimeCategoryInfo) => {
    await start(cat.key, cat.defaultLocationType);
  };

  const handleStop = async () => {
    const result = await stop();
    if (result && result.durationMinutes > 0) {
      await addTimeEntry({
        date: todayString(),
        durationMinutes: result.durationMinutes,
        category: result.category,
        locationType: result.locationType,
        notes: result.notes,
        startTime: result.startedAt,
        endTime: new Date().toISOString(),
        isTimerBased: true,
      });
    }
    navigate('/');
  };

  const handleDiscard = async () => {
    await discard();
    setShowDiscard(false);
    navigate('/');
  };

  // Category selection screen
  if (!activeTimer) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-light">Start Timer</h2>
        <p className="text-sm text-text-muted">Select a category to begin timing.</p>
        <CategoryGrid onSelect={handleCategorySelect} />
      </div>
    );
  }

  // Timer running screen
  const catInfo = getTimeCategoryInfo(activeTimer.category);

  return (
    <div className="flex flex-col items-center space-y-6 pt-8">
      {/* Timer display */}
      <div className="font-mono-num text-6xl font-bold text-text-light tracking-wider">
        {formatTimerDisplay(elapsed)}
      </div>

      {/* Category & location */}
      <div className="text-center">
        <p className="text-sm font-medium text-gold">
          <span className="mr-1">{catInfo.icon}</span>
          {catInfo.label}
        </p>
        <p className="text-xs text-text-muted mt-1 capitalize">
          {activeTimer.locationType.replace('_', '-')}
        </p>
      </div>

      {isPaused && (
        <span className="text-sm text-coral font-medium animate-pulse">Paused</span>
      )}

      {/* Notes */}
      <textarea
        value={activeTimer.notes}
        onChange={e => updateNotes(e.target.value)}
        placeholder="Add notes (optional)..."
        className="w-full bg-forest-deep text-text-light text-sm rounded-xl px-4 py-3 placeholder-text-muted/50 resize-none focus:outline-none focus:ring-1 focus:ring-gold/50 min-h-[60px]"
        rows={2}
      />

      {/* Controls */}
      <div className="flex gap-4 w-full">
        {isPaused ? (
          <button
            onClick={resume}
            className="flex-1 bg-gold text-forest-deep font-semibold py-4 rounded-xl text-base active:scale-[0.97] transition-transform min-h-[44px]"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex-1 border border-gold text-gold font-semibold py-4 rounded-xl text-base active:scale-[0.97] transition-transform min-h-[44px]"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleStop}
          className="flex-1 bg-teal text-forest-deep font-semibold py-4 rounded-xl text-base active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Stop & Save
        </button>
      </div>

      {/* Discard */}
      {!showDiscard ? (
        <button
          onClick={() => setShowDiscard(true)}
          className="text-xs text-text-muted hover:text-red transition-colors min-h-[44px]"
        >
          Discard Timer
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-red">Discard this timer?</span>
          <button
            onClick={handleDiscard}
            className="text-sm text-red font-semibold px-3 py-1 border border-red rounded-lg min-h-[44px]"
          >
            Yes, Discard
          </button>
          <button
            onClick={() => setShowDiscard(false)}
            className="text-sm text-text-muted px-3 py-1 min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
