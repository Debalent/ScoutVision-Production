// ─── ScoutVision Prospect Data Context ─────────────────────────────
// Handles live/demo prospect fetching, optimistic writes, and UI-facing
// loading/error state so pages can remain fully usable during demos.

'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Prospect } from '../lib/types';
import { PROSPECTS as FALLBACK_PROSPECTS } from '../lib/mock-data';
import { useSport } from './SportContext';

interface ProspectContextType {
  prospects: Prospect[];
  loading: boolean;
  error: string | null;
  mode: 'demo' | 'live';
  addProspect: (prospect: Prospect) => void;
  refreshProspects: () => Promise<void>;
  showAddModal: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

const ProspectContext = createContext<ProspectContextType>({
  prospects: FALLBACK_PROSPECTS,
  loading: false,
  error: null,
  mode: 'demo',
  addProspect: () => {},
  refreshProspects: async () => {},
  showAddModal: false,
  openAddModal: () => {},
  closeAddModal: () => {},
});

export function ProspectProvider({ children }: { children: React.ReactNode }) {
  const { demoMode } = useSport();
  const [prospects, setProspects]     = useState<Prospect[]>(FALLBACK_PROSPECTS);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProspects = useCallback(async () => {
    if (demoMode) {
      // In Demo Mode, keep deterministic local data and avoid backend dependency.
      setProspects(FALLBACK_PROSPECTS);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prospects');
      if (res.ok) {
        const data = await res.json();
        setProspects(Array.isArray(data) ? data : data.prospects ?? FALLBACK_PROSPECTS);
      } else {
        setError('Live API unavailable. Switch to Demo Mode to continue exploring.');
        setProspects(FALLBACK_PROSPECTS);
      }
    } catch {
      // Preserve product usability by gracefully falling back to in-memory demo data.
      setError('Unable to reach live backend. Showing demo data.');
      setProspects(FALLBACK_PROSPECTS);
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  // Load from API on mount
  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const addProspect = useCallback(async (prospect: Prospect) => {
    // Optimistic update
    setProspects((prev) => [prospect, ...prev]);
    if (demoMode) {
      return;
    }
    try {
      await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospect),
      });
    } catch {
      // Silently keep the optimistic update
    }
  }, [demoMode]);

  const openAddModal  = useCallback(() => setShowAddModal(true), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  return (
    <ProspectContext.Provider value={{ prospects, loading, error, mode: demoMode ? 'demo' : 'live', addProspect, refreshProspects: fetchProspects, showAddModal, openAddModal, closeAddModal }}>
      {children}
    </ProspectContext.Provider>
  );
}

export function useProspects() {
  return useContext(ProspectContext);
}

