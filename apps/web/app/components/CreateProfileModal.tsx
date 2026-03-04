'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTeam, TeamRole, TeamMember } from './TeamContext';

const ROLES: { value: TeamRole; label: string; description: string; color: string }[] = [
  { value: 'Admin', label: 'Admin', description: 'Full access — manage team, billing, and all data', color: 'purple' },
  { value: 'Coach', label: 'Coach', description: 'View all prospects, edit pipeline, send communications, run AI analysis', color: 'blue' },
  { value: 'Analyst', label: 'Analyst', description: 'View prospects, run reports & AI analysis, read-only pipeline', color: 'green' },
  { value: 'Assistant', label: 'Assistant', description: 'View assigned prospects, add notes, log contacts', color: 'gray' },
];

const ROLE_COLORS: Record<string, string> = {
  purple: 'border-purple-500/40 bg-purple-500/10 text-purple-300 ring-purple-500/30',
  blue: 'border-blue-500/40 bg-blue-500/10 text-blue-300 ring-blue-500/30',
  green: 'border-green-500/40 bg-green-500/10 text-green-300 ring-green-500/30',
  gray: 'border-gray-500/40 bg-gray-500/10 text-gray-300 ring-gray-500/30',
};

const ROLE_BADGE: Record<TeamRole, string> = {
  Admin: 'bg-purple-500/20 text-purple-300',
  Coach: 'bg-blue-500/20 text-blue-300',
  Analyst: 'bg-green-500/20 text-green-300',
  Assistant: 'bg-gray-500/20 text-gray-300',
};

export default function CreateProfileModal() {
  const { showCreateModal, closeCreateModal, addMember } = useTeam();
  const firstInput = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('Coach');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showCreateModal) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('Coach');
      setPhone('');
      setTitle('');
      setErrors({});
      setShowSuccess(false);
      setTimeout(() => firstInput.current?.focus(), 100);
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (!showCreateModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCreateModal();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCreateModal, closeCreateModal]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!role) errs.role = 'Role is required';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      role,
      avatar: null,
      lastActive: '',
      status: 'invited',
    };

    addMember(newMember);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      closeCreateModal();
    }, 1500);
  }

  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Create Profile">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCreateModal} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0f1923] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0f1923]/95 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">Invitation Sent!</p>
            <p className="text-sm text-gray-400 mt-1">{firstName} {lastName} has been invited as {role}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-electric-600/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Profile</h2>
              <p className="text-xs text-gray-400">Add a new team member and assign their role</p>
            </div>
          </div>
          <button onClick={closeCreateModal} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5 custom-scrollbar">
          {/* Name */}
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Info</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">First Name <span className="text-red-400">*</span></label>
                <input ref={firstInput} type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }} className={`input-field w-full text-sm ${errors.firstName ? 'border-red-500/50' : ''}`} placeholder="John" />
                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Last Name <span className="text-red-400">*</span></label>
                <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }} className={`input-field w-full text-sm ${errors.lastName ? 'border-red-500/50' : ''}`} placeholder="Smith" />
                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
              </div>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }} className={`input-field w-full text-sm ${errors.email ? 'border-red-500/50' : ''}`} placeholder="john.smith@university.edu" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone <span className="text-gray-600">(optional)</span></label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full text-sm" placeholder="(555) 123-4567" />
              </div>
            </div>
          </fieldset>

          {/* Title */}
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Position</legend>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job Title <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field w-full text-sm" placeholder="e.g. Defensive Coordinator, Director of Recruiting" />
            </div>
          </fieldset>

          {/* Role Selection */}
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Role Assignment <span className="text-red-400">*</span></legend>
            {errors.role && <p className="text-xs text-red-400 mb-2">{errors.role}</p>}
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((r) => {
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setRole(r.value); setErrors((p) => ({ ...p, role: '' })); }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? `${ROLE_COLORS[r.color]} ring-1`
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected ? `border-current` : 'border-gray-600'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${selected ? '' : 'text-white'}`}>{r.label}</span>
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] rounded-full font-medium ${ROLE_BADGE[r.value]}`}>{r.value}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${selected ? 'opacity-80' : 'text-gray-500'}`}>{r.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Preview */}
          {(firstName || lastName || email) && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center text-sm font-medium text-white">
                  {(firstName[0] || '').toUpperCase()}{(lastName[0] || '').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{firstName || '—'} {lastName || '—'}</span>
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] rounded-full font-medium ${ROLE_BADGE[role]}`}>{role}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{email || 'email@university.edu'}</p>
                  {title && <p className="text-xs text-gray-400 truncate">{title}</p>}
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-500/20 text-yellow-300 font-medium">Invited</span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <button type="button" onClick={closeCreateModal} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
