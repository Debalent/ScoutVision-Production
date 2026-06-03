'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Prospect } from '../lib/types';
import { PROSPECTS as FALLBACK_PROSPECTS } from '../lib/mock-data';

interface ProspectContextType {
  prospects: Prospect[];
  loading: boolean;
  addProspect: (prospect: Prospect) => void;
  refreshProspects: () => Promise<void>;
  showAddModal: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

const ProspectContext = createContext<ProspectContextType>({
  prospects: FALLBACK_PROSPECTS,
  loading: false,
  addProspect: () => {},
  refreshProspects: async () => {},
  showAddModal: false,
  openAddModal: () => {},
  closeAddModal: () => {},
});

export function ProspectProvider({ children }: { children: React.ReactNode }) {
  const [prospects, setProspects]     = useState<Prospect[]>(FALLBACK_PROSPECTS);
  const [loading, setLoading]         = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prospects');
      if (res.ok) {
        const data = await res.json();
        setProspects(Array.isArray(data) ? data : data.prospects ?? FALLBACK_PROSPECTS);
      }
    } catch {
      // Keep existing / fallback data on network error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from API on mount
  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const addProspect = useCallback(async (prospect: Prospect) => {
    // Optimistic update
    setProspects((prev) => [prospect, ...prev]);
    try {
      await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospect),
      });
    } catch {
      // Silently keep the optimistic update
    }
  }, []);

  const openAddModal  = useCallback(() => setShowAddModal(true), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  return (
    <ProspectContext.Provider value={{ prospects, loading, addProspect, refreshProspects: fetchProspects, showAddModal, openAddModal, closeAddModal }}>
      {children}
    </ProspectContext.Provider>
  );
}

export function useProspects() {
  return useContext(ProspectContext);
}

