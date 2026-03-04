'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { Prospect } from '../lib/types';
import { PROSPECTS, STAGES } from '../lib/mock-data';

interface ProspectContextType {
  prospects: Prospect[];
  addProspect: (prospect: Prospect) => void;
  showAddModal: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

const ProspectContext = createContext<ProspectContextType>({
  prospects: PROSPECTS,
  addProspect: () => {},
  showAddModal: false,
  openAddModal: () => {},
  closeAddModal: () => {},
});

export function ProspectProvider({ children }: { children: React.ReactNode }) {
  const [prospects, setProspects] = useState<Prospect[]>(PROSPECTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const addProspect = useCallback((prospect: Prospect) => {
    setProspects((prev) => [prospect, ...prev]);
  }, []);

  const openAddModal = useCallback(() => setShowAddModal(true), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  return (
    <ProspectContext.Provider value={{ prospects, addProspect, showAddModal, openAddModal, closeAddModal }}>
      {children}
    </ProspectContext.Provider>
  );
}

export function useProspects() {
  return useContext(ProspectContext);
}
