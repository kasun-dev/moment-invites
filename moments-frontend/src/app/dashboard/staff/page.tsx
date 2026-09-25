'use client';

import { useState } from 'react';
import { ShieldCheck, UserPlus, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function StaffPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Note for backend implementation: 
  // In Supabase, to create an auth user without logging out the current admin, 
  // you typically send this data to a secure Edge Function or use the supabase.auth.admin API.
  // This UI captures the data for your workflow.
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay for creating a staff member
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto text-zinc-300">
      
      {/* Professional Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Staff Management</h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">Add and manage team access to the workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Staff Form */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#B8905B]" /> Invite Worker
            </h2>

            <form onSubmit={handleAddStaff} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all"
                  placeholder="worker@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all appearance-none"
                >
                  <option value="Editor">Editor (Manage Events)</option>
                  <option value="Admin">Administrator (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || submitted}
                className={`w-full py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
                  submitted 
                    ? 'bg-green-950/40 text-green-500 border border-green-900' 
                    : 'bg-[#B8905B] hover:bg-[#a67e49] text-[#121110]'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitted ? <><CheckCircle2 className="w-4 h-4"/> Invite Sent</> : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Staff Roster */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Personnel</h3>
              <ShieldCheck className="w-5 h-5 text-zinc-600" />
            </div>
            
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/40 text-zinc-500 border-b border-zinc-800 uppercase text-[9px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5">Account Email</th>
                  <th className="px-6 py-5 text-center">Role</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {/* Primary Admin Record */}
                <tr className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B8905B]/10 border border-[#B8905B]/30 flex items-center justify-center text-[#B8905B]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-white font-medium">admin@studioclicked.com</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-md border bg-[#B8905B]/10 text-[#B8905B] border-[#B8905B]/30 text-[9px] font-black uppercase tracking-widest">Master Admin</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
                    </span>
                  </td>
                </tr>

                {/* Example Worker Record */}
                <tr className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-zinc-300 font-medium">editor@studioclicked.com</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-md border bg-zinc-900 text-zinc-400 border-zinc-700 text-[9px] font-black uppercase tracking-widest">Editor</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Pending Invite
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}