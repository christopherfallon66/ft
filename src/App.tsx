import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { seedDatabase } from './db/database';
import { useTimer } from './hooks/useTimer';
import { addTimeEntry } from './hooks/useTimeEntries';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import LogTime from './pages/LogTime';
import AddExpense from './pages/AddExpense';
import History from './pages/History';
import Settings from './pages/Settings';

function CrashRecovery() {
  const { activeTimer, elapsed, stop, discard } = useTimer();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check for orphaned timer on mount (page was killed while timer was running)
    if (activeTimer && !showPrompt) {
      const lastCheck = new Date(activeTimer.lastCheckpoint).getTime();
      const now = Date.now();
      // If last checkpoint was > 60 seconds ago and we just loaded, it's a crash recovery
      if (now - lastCheck > 60000) {
        setShowPrompt(true);
      }
    }
  }, [activeTimer?.id]);

  if (!showPrompt || !activeTimer) return null;

  const minutes = Math.round(elapsed / 60);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-forest-deep rounded-2xl p-6 max-w-sm w-full space-y-4">
        <h3 className="text-lg font-semibold text-text-light">Timer Recovered</h3>
        <p className="text-sm text-text-muted">
          You had a timer running for <span className="text-gold">{activeTimer.category.replace('_', ' ')}</span>.
          Duration: <span className="text-gold font-mono-num">{Math.floor(minutes / 60)}h {minutes % 60}m</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 bg-gold text-forest-deep font-semibold py-3 rounded-xl"
          >
            Resume
          </button>
          <button
            onClick={async () => {
              const result = await stop();
              if (result && result.durationMinutes > 0) {
                await addTimeEntry({
                  date: new Date().toLocaleDateString('en-CA'),
                  durationMinutes: result.durationMinutes,
                  category: result.category,
                  locationType: result.locationType,
                  notes: result.notes,
                  isTimerBased: true,
                });
              }
              setShowPrompt(false);
            }}
            className="flex-1 bg-teal text-forest-deep font-semibold py-3 rounded-xl"
          >
            Save
          </button>
          <button
            onClick={async () => { await discard(); setShowPrompt(false); }}
            className="px-4 py-3 text-red text-sm font-medium rounded-xl border border-red"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center">
        <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="w-16 h-16 animate-pulse" />
      </div>
    );
  }

  return (
    <HashRouter>
      <CrashRecovery />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/log-time" element={<LogTime />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
