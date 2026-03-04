'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TeamRole = 'Admin' | 'Coach' | 'Analyst' | 'Assistant';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar: string | null;
  lastActive: string;
  status: 'active' | 'invited' | 'disabled';
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Coach Rivera', email: 'rivera@university.edu', role: 'Admin', avatar: null, lastActive: '2024-01-15T10:30:00Z', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'chen@university.edu', role: 'Coach', avatar: null, lastActive: '2024-01-15T09:15:00Z', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'johnson@university.edu', role: 'Analyst', avatar: null, lastActive: '2024-01-14T16:45:00Z', status: 'active' },
  { id: '4', name: 'Lisa Park', email: 'park@university.edu', role: 'Assistant', avatar: null, lastActive: '2024-01-13T11:00:00Z', status: 'active' },
  { id: '5', name: 'David Brown', email: 'brown@university.edu', role: 'Coach', avatar: null, lastActive: '', status: 'invited' },
];

interface TeamContextType {
  team: TeamMember[];
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  removeMember: (id: string) => void;
  showCreateModal: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function addMember(member: TeamMember) {
    setTeam((prev) => [member, ...prev]);
  }

  function updateMember(id: string, updates: Partial<TeamMember>) {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }

  function removeMember(id: string) {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  function openCreateModal() {
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  return (
    <TeamContext.Provider value={{ team, addMember, updateMember, removeMember, showCreateModal, openCreateModal, closeCreateModal }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
