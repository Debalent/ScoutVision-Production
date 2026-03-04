'use client';

import { useState, useRef, useEffect } from 'react';
import { useProspects } from './ProspectContext';
import { STAGES } from '../lib/mock-data';
import type { Prospect } from '../lib/types';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const POSITIONS = ['QB','RB','WR','TE','OL','DL','DE','DT','LB','CB','S','K','P','ATH'];

const CLASS_YEARS = [2025, 2026, 2027, 2028, 2029];

export default function AddProspectModal() {
  const { showAddModal, closeAddModal, addProspect } = useProspects();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [highSchool, setHighSchool] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [classYear, setClassYear] = useState(2027);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [stageId, setStageId] = useState('s1');
  const [hudlUrl, setHudlUrl] = useState('');
  const [gpa, setGpa] = useState('');
  const [tags, setTags] = useState('');
  const [bio, setBio] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Focus first input on open
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [showAddModal]);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && showAddModal) closeAddModal();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, closeAddModal]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAddModal();
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (gpa && (isNaN(Number(gpa)) || Number(gpa) < 0 || Number(gpa) > 5.0)) e.gpa = 'GPA must be 0–5.0';
    if (weight && (isNaN(Number(weight)) || Number(weight) < 0)) e.weight = 'Invalid weight';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resetForm() {
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setPosition(''); setHighSchool(''); setCity(''); setState('');
    setClassYear(2027); setHeight(''); setWeight(''); setStageId('s1');
    setHudlUrl(''); setGpa(''); setTags(''); setBio('');
    setErrors({}); setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
    const newProspect: Prospect = {
      id: `pr_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      imageUrl: null,
      position: position || null,
      height: height.trim() || null,
      weight: weight ? Number(weight) : null,
      highSchool: highSchool.trim() || null,
      clubTeam: null,
      city: city.trim() || null,
      state: state || null,
      zipCode: null,
      hudlUrl: hudlUrl.trim() || null,
      twitterUrl: null,
      instagramUrl: null,
      tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      commitmentScore: null,
      classYear,
      status: 'active',
      stats: null,
      academics: gpa ? {
        id: `ac_${Date.now()}`,
        gpa: Number(gpa),
        satScore: null,
        actScore: null,
        school: highSchool.trim() || null,
        gradYear: classYear,
        intendedMajor: null,
        ncaaEligible: null,
        coreGpa: null,
      } : null,
      stage,
      stageId,
      stageOrder: 0,
      notes: [],
      evaluations: [],
      videos: [],
      visits: [],
      contactLogs: [],
      emails: [],
      programId: 'p1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProspect(newProspect);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
      closeAddModal();
    }, 1500);
  }

  if (!showAddModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[5vh] sm:pt-[8vh] px-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-navy/95 border border-white/10 rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
      >
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-navy/95 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">Prospect Added!</p>
            <p className="text-sm text-gray-400 mt-1">{firstName} {lastName} has been added to your pipeline.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Prospect</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details below to add a prospect to your pipeline</p>
          </div>
          <button
            onClick={closeAddModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Basic Info */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Basic Information</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">First Name <span className="text-red-400">*</span></label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`input py-2 text-sm w-full ${submitted && errors.firstName ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="Marcus"
                />
                {submitted && errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Last Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`input py-2 text-sm w-full ${submitted && errors.lastName ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="Johnson"
                />
                {submitted && errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input py-2 text-sm w-full ${submitted && errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="player@email.com"
                />
                {submitted && errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder="555-0100"
                />
              </div>
            </div>
          </fieldset>

          {/* Athletic Info */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Athletic Details</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-400 mb-1 block">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="input py-2 text-sm w-full bg-navy/50"
                  title="Select position"
                >
                  <option value="">Select</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder={`6'2"`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Weight (lbs)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={`input py-2 text-sm w-full ${submitted && errors.weight ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="205"
                />
                {submitted && errors.weight && <p className="text-xs text-red-400 mt-1">{errors.weight}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Class Year</label>
                <select
                  value={classYear}
                  onChange={(e) => setClassYear(Number(e.target.value))}
                  className="input py-2 text-sm w-full bg-navy/50"
                  title="Select class year"
                >
                  {CLASS_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* School & Location */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">School &amp; Location</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">High School</label>
                <input
                  type="text"
                  value={highSchool}
                  onChange={(e) => setHighSchool(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder="Lincoln Prep"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder="Atlanta"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input py-2 text-sm w-full bg-navy/50"
                  title="Select state"
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Recruiting Info */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Recruiting</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pipeline Stage</label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="input py-2 text-sm w-full bg-navy/50"
                  title="Select pipeline stage"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">GPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className={`input py-2 text-sm w-full ${submitted && errors.gpa ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="3.6"
                />
                {submitted && errors.gpa && <p className="text-xs text-red-400 mt-1">{errors.gpa}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Hudl URL</label>
                <input
                  type="url"
                  value={hudlUrl}
                  onChange={(e) => setHudlUrl(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder="https://hudl.com/v/..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tags <span className="text-[10px] text-gray-600">(comma-separated)</span></label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input py-2 text-sm w-full"
                  placeholder="Priority, Film Reviewed"
                />
              </div>
            </div>
          </fieldset>

          {/* Bio */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Notes</legend>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input py-2 text-sm w-full min-h-[80px] resize-none"
              placeholder="Quick scouting notes or bio..."
            />
          </fieldset>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-charcoal/50">
          <button
            type="button"
            onClick={() => { resetForm(); closeAddModal(); }}
            className="btn-secondary text-sm px-5"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary text-sm px-5"
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
              Add Prospect
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
