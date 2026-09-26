'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, CheckCircle2, Clock, Utensils, MessageSquareHeart, 
  Download, Loader2, PartyPopper, AlertCircle 
} from 'lucide-react';

export default function ClientPortalPage() {
  const params = useParams();
  const clientToken = params.token as string;

  const [event, setEvent] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      // 1. Fetch Event by Secure Client Token
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('client_token', clientToken)
        .single();

      if (eventError || !eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);

      // 2. Fetch all guests for this event
      const { data: guestData } = await supabase
        .from('guests')
        .select('*, sub_guests(*)')
        .eq('event_id', eventData.id)
        .order('created_at', { ascending: false });

      if (guestData) setGuests(guestData);
      setLoading(false);
    };

    fetchPortalData();
  }, [clientToken]);

  // ── Analytics Calculation ──
  const calculateStats = () => {
    let totalExpected = 0;
    let totalConfirmed = 0;
    let totalPending = 0;
    let totalDeclined = 0;
    let dietary: Record<string, number> = { Standard: 0, Vegetarian: 0, Vegan: 0, Halal: 0, Allergies: 0 };
    let messages: { name: string, msg: string }[] = [];

    guests.forEach(g => {
      totalExpected++;
      if (g.rsvp_status === 'confirmed' && g.is_attending) totalConfirmed++;
      else if (g.rsvp_status === 'declined') totalDeclined++;
      else totalPending++;

      if (g.is_attending && event?.ask_dietary && g.dietary_preference) {
        dietary[g.dietary_preference] = (dietary[g.dietary_preference] || 0) + 1;
      }
      if (g.guestbook_message) {
        messages.push({ name: g.first_name, msg: g.guestbook_message });
      }

      g.sub_guests?.forEach((sg: any) => {
        totalExpected++;
        if (sg.is_attending) totalConfirmed++;
        if (sg.is_attending && event?.ask_dietary && sg.dietary_preference) {
          dietary[sg.dietary_preference] = (dietary[sg.dietary_preference] || 0) + 1;
        }
      });
    });

    return { totalExpected, totalConfirmed, totalPending, totalDeclined, dietary, messages };
  };

  // ── CSV Catering Export ──
  const exportCateringCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Guest Name,Type,Dietary Preference,Attending Events,Phone\n";

    guests.forEach(g => {
      if (g.rsvp_status === 'confirmed' && g.is_attending) {
        const events = g.attending_events?.map((evId: string) => event.itinerary?.find((i:any)=> i.id === evId)?.name).join(' & ') || 'N/A';
        csvContent += `"${g.first_name}",Primary,"${g.dietary_preference || 'Standard'}","${events}","${g.phone || ''}"\n`;
      }
      g.sub_guests?.forEach((sg: any) => {
        if (sg.is_attending) {
          const sgEvents = sg.attending_events?.map((evId: string) => event.itinerary?.find((i:any)=> i.id === evId)?.name).join(' & ') || 'N/A';
          csvContent += `"${sg.full_name}",Plus One/Family,"${sg.dietary_preference || 'Standard'}","${sgEvents}",""\n`;
        }
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event?.title.replace(/\s+/g, '_')}_Catering_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen bg-[#121110] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#B8905B] animate-spin" /></div>;
  
  if (!event) return (
    <div className="min-h-screen bg-[#121110] flex items-center justify-center flex-col text-zinc-500">
      <AlertCircle className="w-12 h-12 mb-4 text-red-500/50" />
      <h1 className="text-2xl font-serif text-white mb-2">Portal Not Found</h1>
      <p className="text-xs uppercase tracking-widest">This secure link is invalid or has expired.</p>
    </div>
  );

  const stats = calculateStats();
  const progressPercentage = stats.totalExpected > 0 ? (stats.totalConfirmed / stats.totalExpected) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#B8905B]/30 pb-20">
      
      {/* Brand Header */}
      <div className="w-full border-b border-zinc-800/80 bg-[#121110] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#B8905B]/50 flex items-center justify-center font-serif text-[#B8905B] italic text-lg rounded-sm">M</div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hidden sm:block">Client Portal</span>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Powered by Studio Click.ed</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8905B] font-bold mb-3 flex items-center gap-2">
              <PartyPopper className="w-4 h-4" /> Live RSVP Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">{event.title}</h1>
            <p className="text-sm text-zinc-500 mt-3 flex items-center gap-2 font-mono">
              {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={exportCateringCSV}
            className="px-6 py-3 bg-[#B8905B] hover:bg-white text-[#121110] font-black uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#B8905B]/20"
          >
            <Download className="w-4 h-4" /> Export Catering List (CSV)
          </button>
        </div>

        {/* Top-Level Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg">
            <Users className="w-5 h-5 text-zinc-600 mb-3" />
            <p className="text-3xl font-light text-white mb-1">{stats.totalExpected}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Expected</p>
          </div>
          <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5" />
            <CheckCircle2 className="w-5 h-5 text-green-500 mb-3 relative z-10" />
            <p className="text-3xl font-light text-green-400 mb-1 relative z-10">{stats.totalConfirmed}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-green-500/80 relative z-10">Confirmed (Yes)</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg">
            <Clock className="w-5 h-5 text-zinc-600 mb-3" />
            <p className="text-3xl font-light text-zinc-300 mb-1">{stats.totalPending}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Awaiting Reply</p>
          </div>
          <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mb-3" />
            <p className="text-3xl font-light text-red-400 mb-1">{stats.totalDeclined}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-red-500/80">Declined (No)</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl mb-12">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Confirmation Progress</span>
            <span className="text-xs font-mono text-[#B8905B]">{progressPercentage.toFixed(0)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-gradient-to-r from-[#B8905B] to-[#e0bc88] transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dietary Breakdown */}
          {event.ask_dietary && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8">
              <h3 className="font-serif text-2xl text-white mb-6 flex items-center gap-3">
                <Utensils className="w-6 h-6 text-[#B8905B]" /> Dietary Requirements
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.dietary).map(([diet, count]) => {
                  if (count === 0 && diet !== 'Standard') return null;
                  return (
                    <div key={diet} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800/80 rounded-xl">
                      <span className="text-sm font-medium text-zinc-300">{diet}</span>
                      <span className={`text-lg font-light ${diet !== 'Standard' && count > 0 ? 'text-orange-400' : 'text-zinc-500'}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Digital Guestbook */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 flex flex-col h-[500px]">
            <h3 className="font-serif text-2xl text-white mb-2 flex items-center gap-3">
              <MessageSquareHeart className="w-6 h-6 text-[#B8905B]" /> Digital Guestbook
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-6">Wishes from your guests</p>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {stats.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <MessageSquareHeart className="w-10 h-10 text-zinc-600 mb-3" />
                  <p className="text-xs text-zinc-400 italic">No messages received yet.</p>
                </div>
              ) : (
                stats.messages.map((m, i) => (
                  <div key={i} className="bg-[#121110] border border-zinc-800 p-5 rounded-xl relative">
                    <div className="absolute -left-1 top-4 w-2 h-8 bg-[#B8905B] rounded-r-md opacity-20" />
                    <p className="text-sm text-zinc-300 italic leading-relaxed mb-3">"{m.msg}"</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#B8905B] font-bold">— {m.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}