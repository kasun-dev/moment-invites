'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserCircle, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || '');
    };
    getUser();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-zinc-300">
      <div className="mb-10 border-b border-zinc-800/60 pb-6">
        <h1 className="text-3xl font-serif text-white tracking-tight">My Profile</h1>
        <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">Manage your account credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Info Box */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center shadow-lg">
            <UserCircle className="w-16 h-16 text-[#B8905B] mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Active User</p>
            <p className="text-sm font-bold text-white truncate">{email}</p>
          </div>
        </div>

        {/* Right Column: Password Form */}
        <div className="md:col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#B8905B]" /> Change Password
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all"
                  placeholder="••••••••"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-wide text-center flex items-center justify-center gap-2 ${
                  message.type === 'error' ? 'bg-red-950/20 text-red-400 border-red-900/30' : 'bg-green-950/20 text-green-400 border-green-900/30'
                }`}>
                  {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#B8905B] hover:bg-[#a67e49] text-[#121110] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}