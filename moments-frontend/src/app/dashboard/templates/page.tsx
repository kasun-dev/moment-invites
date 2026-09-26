'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INVITATION_TEMPLATES, TemplateComponents } from '@/components/templates/registry';
import { Palette, ArrowRight, Sparkles, Smartphone, Monitor, X, CheckCircle2 } from 'lucide-react';

// ── Universal Dummy Data for Live Previews ──
// This standard object ensures all current and future templates render perfectly
const MOCK_EVENT = {
  title: "Alexander & Victoria",
  event_date: new Date(Date.now() + 86400000 * 45).toISOString(),
  location: "The Grand Ballroom, Colombo",
  ask_dietary: true,
  itinerary: [
    { id: 'ev-1', name: 'Wedding Ceremony', date: new Date(Date.now() + 86400000 * 45).toISOString(), time: '09:05 AM', location: 'The Grand Ballroom, Colombo' },
    { id: 'ev-2', name: 'Evening Reception', date: new Date(Date.now() + 86400000 * 45).toISOString(), time: '07:00 PM', location: 'The Grand Ballroom, Colombo' }
  ]
};

const MOCK_GUEST = {
  id: 'mock-guest-1',
  first_name: "Jonathan",
  rsvp_status: "pending",
  is_attending: false,
  invited_events: ['ev-1', 'ev-2']
};

const MOCK_SUB_GUESTS = [
  { id: 'mock-sub-1', full_name: "Elizabeth Bennett", is_attending: false }
];

export default function TemplatesPage() {
  const router = useRouter();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  // Helper function to render a stylistic CSS miniature of each theme for the grid
  const renderTemplateMiniature = (templateId: string) => {
    switch (templateId) {
      case 'classic':
        return (
          <div className="bg-[#121110] w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden border border-zinc-800 group-hover:border-[#B8905B]/50 transition-colors">
            <div className="absolute inset-3 border border-[#B8905B]/20 rounded-sm" />
            <div className="absolute inset-4 border border-[#B8905B]/10 rounded-sm" />
            <span className="font-serif text-[#B8905B] text-3xl font-light tracking-widest relative z-10 mb-2">A <span className="italic">&amp;</span> V</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8905B] to-transparent relative z-10 mb-3" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-500 relative z-10">Classic Dark</span>
          </div>
        );
      case 'lily_classic':
        return (
          <div className="bg-[#FAFAF8] w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden border border-[#7C8C74]/30 group-hover:border-[#7C8C74] transition-colors">
            <div className="absolute -top-4 -left-4 w-24 h-24 border border-[#7C8C74]/20 rounded-full opacity-50" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#7C8C74]/20 rounded-full opacity-50" />
            <span className="font-serif text-[#1C1C1A] text-3xl italic relative z-10 mb-2">A <span className="opacity-70">&amp;</span> V</span>
            <div className="w-8 h-px bg-[#A8B5A0] relative z-10 mb-3" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#7C8C74] relative z-10">Soft Lily</span>
          </div>
        );
      case 'kandian':
        return (
          <div className="bg-[#2A0005] w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#52000B_0%,#1F0003_100%)] opacity-80" />
            <div className="absolute inset-2 border-2 border-[#D4AF37]/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#D4AF37]/10 rounded-full" />
            <span className="font-serif text-[#D4AF37] text-3xl font-bold relative z-10 mb-2 text-shadow-sm">A & V</span>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent relative z-10 mb-3" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#F5E6C4] relative z-10">Kandyan Heritage</span>
          </div>
        );
      default:
        return (
          <div className="bg-zinc-900 w-full h-full flex flex-col items-center justify-center border border-zinc-800 group-hover:border-zinc-600 transition-colors">
            <Palette className="w-8 h-8 text-zinc-700 mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Preview Unavailable</span>
          </div>
        );
    }
  };

  const ActivePreviewComponent = previewTheme ? TemplateComponents[previewTheme] : null;
  const activeTemplateMeta = INVITATION_TEMPLATES.find(t => t.id === previewTheme);

  return (
    <div className="max-w-6xl mx-auto text-zinc-300 relative">
      
      {/* ── Live Preview Overlay Modal ── */}
      {previewTheme && ActivePreviewComponent && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-md">
          
          {/* Top Control Bar */}
          <div className="h-20 bg-[#0a0a0a] border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setPreviewTheme(null)} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-white font-serif text-xl leading-none">{activeTemplateMeta?.name}</h2>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B8905B] mt-1">Live Interactive Preview</p>
              </div>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button 
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${deviceMode === 'mobile' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
              <button 
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${deviceMode === 'desktop' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
            </div>

            <button 
              onClick={() => setPreviewTheme(null)}
              className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Close View
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-950 p-4 sm:p-8">
            <div 
              className={`transition-all duration-500 ease-in-out bg-white overflow-y-auto overflow-x-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
                deviceMode === 'mobile' 
                  ? 'w-[375px] h-full max-h-[812px] rounded-[2.5rem] border-[12px] border-[#121110]' 
                  : 'w-full max-w-5xl h-full rounded-2xl border border-zinc-800'
              }`}
            >
              {/* Note: We force re-render by using a key to ensure clean mount */}
              <ActivePreviewComponent 
                key={`${previewTheme}-${deviceMode}`} 
                event={MOCK_EVENT} 
                guest={MOCK_GUEST} 
                subGuestsInitial={MOCK_SUB_GUESTS} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Design Collection</h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">Explore and preview available invitation architectures</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
          <Sparkles className="w-4 h-4 text-[#B8905B]" />
          <span className="text-xs font-bold text-white tracking-wider">{INVITATION_TEMPLATES.length} Premium Themes</span>
        </div>
      </div>

      {/* ── Template Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {INVITATION_TEMPLATES.map((template) => (
          <div 
            key={template.id} 
            className="group flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:bg-zinc-900/80 transition-all hover:-translate-y-1 duration-300"
          >
            {/* Visual Preview Container */}
            <div 
              className="w-full aspect-[4/3] bg-black relative p-4 cursor-pointer"
              onClick={() => setPreviewTheme(template.id)}
            >
              <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl shadow-black/50 pointer-events-none">
                {renderTemplateMiniature(template.id)}
              </div>
              
              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-[#B8905B] text-[#121110] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" /> View Live Demo
                </span>
              </div>
            </div>

            {/* Template Meta Info */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-2xl text-white group-hover:text-[#B8905B] transition-colors">{template.name}</h3>
                <span className="px-2.5 py-1 rounded-md border bg-zinc-950 text-zinc-500 border-zinc-800 text-[8px] font-black uppercase tracking-widest">
                  {template.id}
                </span>
              </div>
              
              <p className="text-sm text-zinc-400 mb-8 flex-1 leading-relaxed">
                {template.preview}
              </p>

              <button 
                onClick={() => setPreviewTheme(template.id)}
                className="w-full py-3.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#B8905B] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                Preview Theme <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Coming Soon Placeholder */}
        <div className="flex flex-col items-center justify-center bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl p-8 aspect-[4/3] h-full">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <Palette className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="font-serif text-xl text-zinc-500 mb-2">More Designs</h3>
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium text-center">
            New architectural themes <br/>are in development
          </p>
        </div>
      </div>

    </div>
  );
}