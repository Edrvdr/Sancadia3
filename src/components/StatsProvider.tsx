import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { StatsContext, type StatsContextValue } from '@/hooks/statsContext';
import { emptyStats, parseStats, recordGameResult, STATS_STORAGE_KEY } from '@/lib/stats';

function loadStats() {
  try {
    const raw = window.localStorage.getItem(STATS_STORAGE_KEY);
    return raw === null ? emptyStats() : parseStats(JSON.parse(raw));
  } catch {
    return emptyStats();
  }
}

function saveStats(stats: ReturnType<typeof emptyStats>) {
  try {
    window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Keep stats in memory when browser storage is unavailable.
  }
}

export default function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState(loadStats);
  const statsRef = useRef(stats);

  const recordResult = useCallback((result: Parameters<typeof recordGameResult>[1]) => {
    const recorded = recordGameResult(statsRef.current, result);
    if (recorded.stats === statsRef.current) return 0;
    statsRef.current = recorded.stats;
    saveStats(recorded.stats);
    setStats(recorded.stats);
    return recorded.pointsEarned;
  }, []);

  const resetStats = useCallback(() => {
    const empty = emptyStats();
    statsRef.current = empty;
    saveStats(empty);
    setStats(empty);
  }, []);

  const value = useMemo<StatsContextValue>(() => ({ stats, recordResult, resetStats }), [stats, recordResult, resetStats]);

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}
