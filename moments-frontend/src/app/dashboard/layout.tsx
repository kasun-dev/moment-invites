'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  UserCircle,
  Users,
  Palette
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Events Workspace', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Web Inquiries', href: '/dashboard/inquiries', icon: MessageSquare },
    { name: 'Design Collection', href: '/dashboard/templates', icon: Palette },
    { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-zinc-800/80 w-64 text-zinc-300 relative z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#B8905B]/50 text-[#B8905B] flex items-center justify-center font-serif italic text-lg rounded-sm shadow-[0_0_10px_rgba(184,144,91,0.1)]">M</div>
          <div className="flex flex-col">
            <span className="font-serif text-lg leading-none text-white tracking-wide">Moments</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Studio Click.ed</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 px-2">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith('/dashboard/events') && item.href === '/dashboard');
          return (
            <button
              key={item.name}
              onClick={() => { router.push(item.href); setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive 
                  ? 'bg-[#B8905B]/10 text-[#B8905B] font-medium border border-[#B8905B]/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <button 
          onClick={() => { router.push('/dashboard/profile'); setIsMobileOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-3 mb-2 bg-zinc-900/50 hover:bg-zinc-900 rounded-lg border border-zinc-800/50 transition-colors text-left"
        >
          <UserCircle className="w-8 h-8 text-zinc-500 shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-white truncate uppercase tracking-widest">My Profile</span>
            <span className="text-[10px] text-zinc-500 truncate">{userEmail}</span>
          </div>
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shadow-2xl">
        <SidebarContent />
      </div>

      {/* Mobile Header & Overlay */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-zinc-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-[#B8905B]/50 text-[#B8905B] flex items-center justify-center font-serif italic text-sm rounded-sm">M</div>
          <span className="font-serif text-lg text-white">Moments</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-zinc-400 hover:text-white">
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="w-64 h-full relative z-50 animate-fade-up">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-[#0a0a0a] pt-16 md:pt-0 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#B8905B]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 p-6 md:p-10 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}