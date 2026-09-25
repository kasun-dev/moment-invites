'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function LoginMandala() {
  return (
    <div className="absolute left-[-20%] top-[10%] w-[800px] h-[800px] opacity-[0.15] pointer-events-none animate-slow-spin">
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
        <g stroke="#B8905B" strokeWidth="1.5">
          <circle cx="400" cy="400" r="300" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="200" />
          <circle cx="400" cy="400" r="100" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 400 400)`}>
              <path d="M400,100 C450,150 480,250 400,300 C320,250 350,150 400,100 Z" />
              <line x1="400" y1="0" x2="400" y2="100" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      router.push('/dashboard');
    } catch (err: any) {
      setError("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        .font-serif-playfair { font-family: 'Playfair Display', serif; }
        .font-sans-jost { font-family: 'Jost', sans-serif; }
        .animate-slow-spin { animation: slowSpin 90s linear infinite; }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a] font-sans-jost text-zinc-300">
        
        {/* Left Column - Branding (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-[#121110] border-r border-zinc-800/80">
          <LoginMandala />
          
          <div className="relative z-10">
            <div className="w-12 h-12 border border-[#B8905B]/50 text-[#B8905B] flex items-center justify-center font-serif-playfair italic text-2xl rounded-sm mb-6 shadow-[0_0_15px_rgba(184,144,91,0.15)]">M</div>
            <h1 className="text-4xl font-serif-playfair text-white tracking-tight leading-snug">
              Moments by <br />
              <span className="text-[#B8905B] italic">Studio Click.ed</span>
            </h1>
          </div>

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">Workspace Portal</p>
            <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
              Secure access for event administrators and staff to manage digital invitations, leads, and guest rosters.
            </p>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex items-center justify-center p-8 relative">
          <div className="w-full max-w-md space-y-8 animate-fade-up">
            
            {/* Mobile Header (Only visible on small screens) */}
            <div className="lg:hidden text-center mb-10">
              <div className="w-12 h-12 mx-auto border border-[#B8905B]/50 text-[#B8905B] flex items-center justify-center font-serif-playfair italic text-2xl rounded-sm mb-4">M</div>
              <h1 className="text-3xl font-serif-playfair text-white tracking-tight">Moments</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">by Studio Click.ed</p>
            </div>

            <div>
              <h2 className="text-2xl font-serif-playfair text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-zinc-500">Sign in to your administrative workspace.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 mt-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-[#B8905B] outline-none transition-all text-white placeholder:text-zinc-700"
                  placeholder="admin@studioclicked.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-[#B8905B] outline-none transition-all text-white placeholder:text-zinc-700"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs font-bold uppercase tracking-wide bg-red-950/20 p-4 rounded-xl border border-red-900/30 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#B8905B] hover:bg-[#a67e49] text-[#121110] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Workspace'}
              </button>
            </form>
            
            <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mt-8">
              Secure area. Authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}