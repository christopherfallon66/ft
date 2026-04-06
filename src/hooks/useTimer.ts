import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_USER_ID } from '../db/database';
import type { ActiveTimer, TimeCategory, LocationType } from '../types';

export function useTimer() {
  const activeTimer = useLiveQuery(() =>
    db.activeTimer.where('userId').equals(DEFAULT_USER_ID).first()
  );

  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkpointRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate elapsed from active timer state
  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      setIsPaused(false);
      return;
    }

    setIsPaused(activeTimer.isPaused);

    if (activeTimer.isPaused) {
      setElapsed(activeTimer.accumulatedSeconds);
      return;
    }

    // Timer is running - calculate from startedAt + accumulated
    const calcElapsed = () => {
      const now = Date.now();
      const started = new Date(activeTimer.startedAt).getTime();
      const pauseOffset = activeTimer.accumulatedSeconds;
      // accumulatedSeconds includes all prior pause-adjusted time
      // startedAt is reset on resume, so elapsed = accumulated + (now - startedAt)
      const runningSeconds = Math.floor((now - started) / 1000);
      return pauseOffset + runningSeconds;
    };

    setElapsed(calcElapsed());

    intervalRef.current = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);

    // Checkpoint every 30 seconds
    checkpointRef.current = setInterval(async () => {
      const secs = calcElapsed();
      await db.activeTimer.update(activeTimer.id, {
        lastCheckpoint: new Date().toISOString(),
        accumulatedSeconds: secs,
      });
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (checkpointRef.current) clearInterval(checkpointRef.current);
    };
  }, [activeTimer?.id, activeTimer?.isPaused, activeTimer?.startedAt, activeTimer?.accumulatedSeconds]);

  const start = useCallback(async (category: TimeCategory, locationType: LocationType) => {
    // Clear any existing timer
    await db.activeTimer.where('userId').equals(DEFAULT_USER_ID).delete();

    const timer: ActiveTimer = {
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      category,
      locationType,
      startedAt: new Date().toISOString(),
      lastCheckpoint: new Date().toISOString(),
      accumulatedSeconds: 0,
      notes: '',
      isPaused: false,
      pausedAt: null,
    };
    await db.activeTimer.add(timer);
  }, []);

  const pause = useCallback(async () => {
    if (!activeTimer || activeTimer.isPaused) return;
    await db.activeTimer.update(activeTimer.id, {
      isPaused: true,
      pausedAt: new Date().toISOString(),
      accumulatedSeconds: elapsed,
    });
  }, [activeTimer, elapsed]);

  const resume = useCallback(async () => {
    if (!activeTimer || !activeTimer.isPaused) return;
    await db.activeTimer.update(activeTimer.id, {
      isPaused: false,
      pausedAt: null,
      startedAt: new Date().toISOString(),
      // accumulatedSeconds already has the paused total
    });
  }, [activeTimer]);

  const stop = useCallback(async () => {
    if (!activeTimer) return null;
    const durationMinutes = Math.round(elapsed / 60);
    const result = {
      category: activeTimer.category,
      locationType: activeTimer.locationType,
      notes: activeTimer.notes,
      durationMinutes,
      startedAt: activeTimer.startedAt,
    };
    await db.activeTimer.delete(activeTimer.id);
    return result;
  }, [activeTimer, elapsed]);

  const discard = useCallback(async () => {
    if (!activeTimer) return;
    await db.activeTimer.delete(activeTimer.id);
  }, [activeTimer]);

  const updateNotes = useCallback(async (notes: string) => {
    if (!activeTimer) return;
    await db.activeTimer.update(activeTimer.id, { notes });
  }, [activeTimer]);

  return {
    activeTimer,
    elapsed,
    isPaused,
    start,
    pause,
    resume,
    stop,
    discard,
    updateNotes,
  };
}
