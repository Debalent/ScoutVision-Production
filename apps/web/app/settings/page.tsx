'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

type SettingsTab = 'general' | 'team' | 'integrations' | 'notifications' | 'billing' | 'security';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  lastActive: string;
  status: 'active' | 'invited' | 'disabled';
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Coach Rivera', email: 'rivera@university.edu', role: 'Admin', avatar: null, lastActive: '2024-01-15T10:30:00Z', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'chen@university.edu', role: 'Coach', avatar: null, lastActive: '2024-01-15T09:15:00Z', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'johnson@university.edu', role: 'Analyst', avatar: null, lastActive: '2024-01-14T16:45:00Z', status: 'active' },
  { id: '4', name: 'Lisa Park', email: 'park@university.edu', role: 'Assistant', avatar: null, lastActive: '2024-01-13T11:00:00Z', status: 'active' },
  { id: '5', name: 'David Brown', email: 'brown@university.edu', role: 'Coach', avatar: null, lastActive: '', status: 'invited' },
];

const INTEGRATIONS = [
  { id: 'hudl', name: 'Hudl', description: 'Import game film and highlights automatically', icon: 'H', connected: true, category: 'Video' },
  { id: 'maxpreps', name: 'MaxPreps', description: 'Sync prospect stats and rankings', icon: 'M', connected: true, category: 'Data' },
  { id: '247sports', name: '247Sports', description: 'Pull recruiting rankings and profiles', icon: '2', connected: false, category: 'Data' },
  { id: 'rivals', name: 'Rivals', description: 'Access prospect ratings and evaluations', icon: 'R', connected: false, category: 'Data' },
  { id: 'twitter', name: 'X (Twitter)', description: 'Monitor prospect social media activity', icon: 'X', connected: true, category: 'Social' },
  { id: 'instagram', name: 'Instagram', description: 'Track prospect engagement and content', icon: 'I', connected: false, category: 'Social' },
  { id: 'slack', name: 'Slack', description: 'Get real-time notifications in your workspace', icon: 'S', connected: false, category: 'Communication' },
  { id: 'google', name: 'Google Calendar', description: 'Sync visits and recruiting events', icon: 'G', connected: true, category: 'Calendar' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [programName, setProgramName] = useState('University Football');
  const [sport, setSport] = useState('Football');
  const [division, setDivision] = useState('Division I');
  const [conference, setConference] = useState('Big 12');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [saved, setSaved] = useState(false);

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75' },
    { key: 'team', label: 'Team', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { key: 'integrations', label: 'Integrations', icon: 'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244' },
    { key: 'notifications', label: 'Notifications', icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0' },
    { key: 'billing', label: 'Billing', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z' },
    { key: 'security', label: 'Security', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
  ];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your program configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 lg:gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-electric-600/10 text-electric-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Program Settings</h2>
                <p className="text-sm text-gray-400 mt-1">Configure your recruiting program details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Program Name</label>
                  <input type="text" value={programName} onChange={(e) => setProgramName(e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Sport</label>
                  <select value={sport} onChange={(e) => setSport(e.target.value)} className="input-field w-full">
                    <option>Football</option><option>Basketball</option><option>Baseball</option><option>Soccer</option><option>Track & Field</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Division</label>
                  <select value={division} onChange={(e) => setDivision(e.target.value)} className="input-field w-full">
                    <option>Division I</option><option>Division II</option><option>Division III</option><option>NAIA</option><option>JUCO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Conference</label>
                  <input type="text" value={conference} onChange={(e) => setConference(e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field w-full">
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                {saved && <span className="text-sm text-green-400">Settings saved successfully</span>}
                {!saved && <span />}
                <button onClick={handleSave} className="btn-primary text-sm">Save Changes</button>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Team Members</h2>
                    <p className="text-sm text-gray-400 mt-1">{MOCK_TEAM.length} members</p>
                  </div>
                  <button className="btn-primary text-sm">Invite Member</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-left">
                        <th className="pb-3 font-medium text-gray-400">Member</th>
                        <th className="pb-3 font-medium text-gray-400">Role</th>
                        <th className="pb-3 font-medium text-gray-400">Status</th>
                        <th className="pb-3 font-medium text-gray-400">Last Active</th>
                        <th className="pb-3 font-medium text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_TEAM.map((member) => (
                        <tr key={member.id} className="hover:bg-white/[0.02]">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center text-xs font-medium text-white">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-white">{member.name}</div>
                                <div className="text-gray-500 text-xs">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                              member.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' :
                              member.role === 'Coach' ? 'bg-blue-500/20 text-blue-300' :
                              member.role === 'Analyst' ? 'bg-green-500/20 text-green-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : member.status === 'invited' ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                              <span className="text-gray-300 capitalize">{member.status}</span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-400">
                            {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Pending'}
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-gray-400 hover:text-white text-xs">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-white mb-3">Role Permissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {['Admin', 'Coach', 'Analyst', 'Assistant'].map((role) => (
                    <div key={role} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="font-medium text-white mb-2">{role}</div>
                      <ul className="space-y-1 text-gray-400 text-xs">
                        {role === 'Admin' && <><li>Full access</li><li>Manage team</li><li>Billing</li><li>Delete data</li></>}
                        {role === 'Coach' && <><li>View all prospects</li><li>Edit pipeline</li><li>Send communications</li><li>Run AI analysis</li></>}
                        {role === 'Analyst' && <><li>View prospects</li><li>Run reports</li><li>AI analysis</li><li>Read-only pipeline</li></>}
                        {role === 'Assistant' && <><li>View assigned prospects</li><li>Add notes</li><li>Log contacts</li></>}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-1">Integrations</h2>
                <p className="text-sm text-gray-400 mb-6">Connect ScoutVision with your existing tools</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INTEGRATIONS.map((int) => (
                    <div key={int.id} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-4 hover:border-white/10 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        int.connected ? 'bg-electric-600/20 text-electric-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {int.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{int.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{int.category}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{int.description}</p>
                      </div>
                      <button className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        int.connected
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}>
                        {int.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-white mb-3">API Access</h3>
                <p className="text-sm text-gray-400 mb-4">Use our API to build custom integrations</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 bg-black/30 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-400 border border-white/5 truncate">
                    sv_live_••••••••••••••••••••••••
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-secondary text-sm flex-1 sm:flex-none">Regenerate</button>
                    <button className="btn-secondary text-sm flex-1 sm:flex-none">Copy</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-400 mt-1">Choose how you want to be notified</p>
              </div>

              {[
                { category: 'Recruiting Activity', items: [
                  { label: 'New prospect added', email: true, push: true, inApp: true },
                  { label: 'Prospect stage change', email: true, push: true, inApp: true },
                  { label: 'Commitment update', email: true, push: true, inApp: true },
                  { label: 'Visit scheduled', email: true, push: false, inApp: true },
                ]},
                { category: 'AI & Analysis', items: [
                  { label: 'Analysis complete', email: true, push: true, inApp: true },
                  { label: 'Report generated', email: true, push: false, inApp: true },
                  { label: 'High-priority prospect identified', email: true, push: true, inApp: true },
                ]},
                { category: 'Compliance', items: [
                  { label: 'Compliance violation', email: true, push: true, inApp: true },
                  { label: 'Period change reminder', email: true, push: false, inApp: true },
                  { label: 'Contact limit approaching', email: true, push: true, inApp: true },
                ]},
                { category: 'System', items: [
                  { label: 'Weekly digest', email: true, push: false, inApp: false },
                  { label: 'Team member invitation accepted', email: true, push: false, inApp: true },
                  { label: 'Security alert', email: true, push: true, inApp: true },
                ]},
              ].map((section) => (
                <div key={section.category}>
                  <h3 className="font-medium text-white mb-3">{section.category}</h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-white/[0.02]">
                        <span className="text-sm text-gray-300">{item.label}</span>
                        <div className="flex items-center gap-4 shrink-0">
                          {['Email', 'Push', 'In-App'].map((channel, i) => {
                            const enabled = i === 0 ? item.email : i === 1 ? item.push : item.inApp;
                            return (
                              <label key={channel} className="flex items-center gap-1.5 cursor-pointer">
                                <div className={`w-8 h-4.5 rounded-full relative transition-colors ${enabled ? 'bg-electric-600' : 'bg-gray-600'}`}>
                                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
                                </div>
                                <span className="text-xs text-gray-500">{channel}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Current Plan</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage your subscription</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-electric-600/20 text-electric-400 text-sm font-medium self-start sm:self-auto">Elite Plan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { plan: 'Starter', price: '$99', period: '/mo', features: ['Up to 100 prospects', 'Basic CRM', 'Email tracking', 'Compliance calendar'], current: false },
                    { plan: 'Growth', price: '$249', period: '/mo', features: ['Up to 500 prospects', 'AI analysis (10/mo)', 'Video scouting', 'Advanced reports', 'Team collaboration'], current: false },
                    { plan: 'Elite', price: '$499', period: '/mo', features: ['Unlimited prospects', 'Unlimited AI analysis', 'Full biomechanics', 'Custom models', 'API access', 'Priority support', 'White-label options'], current: true },
                  ].map((tier) => (
                    <div key={tier.plan} className={`p-5 rounded-xl border transition-colors ${
                      tier.current ? 'border-electric-500/30 bg-electric-600/5' : 'border-white/5 bg-white/[0.02]'
                    }`}>
                      <div className="text-sm text-gray-400">{tier.plan}</div>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-white">{tier.price}</span>
                        <span className="text-gray-500 text-sm">{tier.period}</span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full mt-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        tier.current ? 'bg-electric-600/20 text-electric-300 cursor-default' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}>
                        {tier.current ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Usage This Month</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Prospects', used: 342, limit: 'Unlimited', pct: 0 },
                    { label: 'AI Analyses', used: 47, limit: 'Unlimited', pct: 0 },
                    { label: 'Storage', used: 12.4, limit: '100 GB', pct: 12 },
                    { label: 'API Calls', used: 8420, limit: '50,000', pct: 17 },
                  ].map((u) => (
                    <div key={u.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-gray-400">{u.label}</div>
                      <div className="text-lg font-semibold text-white mt-1">{typeof u.used === 'number' && u.used > 1000 ? `${(u.used / 1000).toFixed(1)}K` : u.used}</div>
                      <div className="text-xs text-gray-500">of {u.limit}</div>
                      {u.pct > 0 && (
                        <div className="mt-2 h-1 rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-electric-500" style={{ width: `${u.pct}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="card p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Security Settings</h2>
                  <p className="text-sm text-gray-400 mt-1">Protect your account and data</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div>
                      <div className="font-medium text-white text-sm">Two-Factor Authentication</div>
                      <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400">Enabled</button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div>
                      <div className="font-medium text-white text-sm">Single Sign-On (SSO)</div>
                      <p className="text-xs text-gray-400 mt-0.5">Use your university credentials to sign in</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10">Configure</button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div>
                      <div className="font-medium text-white text-sm">Session Management</div>
                      <p className="text-xs text-gray-400 mt-0.5">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <select className="input-field text-xs py-1.5 px-3">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div>
                      <div className="font-medium text-white text-sm">IP Allowlist</div>
                      <p className="text-xs text-gray-400 mt-0.5">Restrict access to specific IP ranges</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10">Manage</button>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Recent Login Activity</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on MacOS', ip: '192.168.1.100', time: '2 minutes ago', current: true },
                    { device: 'Safari on iPhone', ip: '172.16.0.55', time: '3 hours ago', current: false },
                    { device: 'Chrome on Windows', ip: '10.0.0.42', time: '1 day ago', current: false },
                    { device: 'Firefox on Linux', ip: '192.168.1.105', time: '3 days ago', current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-green-400' : 'bg-gray-500'}`} />
                        <div>
                          <div className="text-sm text-white">{session.device} {session.current && <span className="text-xs text-green-400 ml-1">(current)</span>}</div>
                          <div className="text-xs text-gray-500">IP: {session.ip}</div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{session.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Audit Log</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { action: 'Prospect added', user: 'Coach Rivera', time: '10 min ago' },
                    { action: 'AI analysis initiated', user: 'Sarah Chen', time: '25 min ago' },
                    { action: 'Team member invited', user: 'Coach Rivera', time: '1 hour ago' },
                    { action: 'Export generated', user: 'Mike Johnson', time: '2 hours ago' },
                    { action: 'Settings updated', user: 'Coach Rivera', time: '1 day ago' },
                  ].map((log, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 px-3 rounded-lg hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-electric-400 shrink-0" />
                        <span className="text-gray-300 truncate">{log.action}</span>
                        <span className="text-gray-500 shrink-0">by {log.user}</span>
                      </div>
                      <span className="text-gray-500 text-xs shrink-0 pl-4 sm:pl-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
