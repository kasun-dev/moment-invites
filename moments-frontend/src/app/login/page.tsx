'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Note: If you have email confirmations turned on in Supabase, 
        // you will need to check your email here.
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Redirect to the dashboard on successful login
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-wider">MOMENTS</h1>
          <p className="text-sm text-zinc-500 mt-2 tracking-widest uppercase">by Studio Click.ed</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 mt-8">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md focus:ring-2 focus:ring-zinc-500 focus:border-transparent outline-none transition-all text-zinc-100"
              placeholder="admin@studioclicked.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md focus:ring-2 focus:ring-zinc-500 focus:border-transparent outline-none transition-all text-zinc-100"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-md border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-200 hover:bg-white text-zinc-900 font-semibold rounded-md transition-all flex justify-center mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}