// ─── ScoutVision Sport & Demo Mode Context ──────────────────────────
// Global context that manages:
//   1. Selected Sport (football, basketball, baseball, soccer, hockey)
//   2. Selected Level (high_school, college_D1, college_D2, college_JUCO, pro)
//   3. Demo Mode toggle

'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { type SportKey, getSportPack, type SportPack, SPORT_LIST } from '../lib/sport-packs';
import { getLevelPack, type LevelPack, LEVEL_LIST } from '../lib/level-packs';
import { getDemoProspectsForSport, type DemoProspect } from '../lib/demo-data';

// ─── Context Type ───────────────────────────────────────────────────

interface SportContextType {
  // Sport
  sport: SportKey;
  setSport: (sport: SportKey) => void;
  sportPack: SportPack;
  sportList: typeof SPORT_LIST;

  // Level
  level: string;
  setLevel: (level: string) => void;
  levelPack: LevelPack;
  levelList: typeof LEVEL_LIST;

  // Demo Mode
  demoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (on: boolean) => void;
  demoProspects: DemoProspect[];
}

const SportContext = createContext<SportContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────

export function SportProvider({ children }: { children: ReactNode }) {
  const [sport, setSportState] = useState<SportKey>('football');
  const [level, setLevelState] = useState<string>('high_school');
  const [demoMode, setDemoModeState] = useState<boolean>(false);

  const setSport = useCallback((s: SportKey) => setSportState(s), []);
  const setLevel = useCallback((l: string) => setLevelState(l), []);
  const toggleDemoMode = useCallback(() => setDemoModeState((prev) => !prev), []);
  const setDemoMode = useCallback((on: boolean) => setDemoModeState(on), []);

  const sportPack = useMemo(() => getSportPack(sport), [sport]);
  const levelPack = useMemo(() => getLevelPack(level), [level]);
  const demoProspects = useMemo(() => getDemoProspectsForSport(sport), [sport]);

  const value = useMemo<SportContextType>(() => ({
    sport,
    setSport,
    sportPack,
    sportList: SPORT_LIST,
    level,
    setLevel,
    levelPack,
    levelList: LEVEL_LIST,
    demoMode,
    toggleDemoMode,
    setDemoMode,
    demoProspects,
  }), [sport, setSport, sportPack, level, setLevel, levelPack, demoMode, toggleDemoMode, setDemoMode, demoProspects]);

  return (
    <SportContext.Provider value={value}>
      {children}
    </SportContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useSport() {
  const ctx = useContext(SportContext);
  if (!ctx) throw new Error('useSport must be used within SportProvider');
  return ctx;
}
