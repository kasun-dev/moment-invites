'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, MapPin, Plus, CheckCircle2, Clock, Trash2, 
  Users, Check, UserPlus, LayoutGrid, Table as TableIcon, ChevronLeft, ChevronRight, 
  Loader2, Copy, MessageSquare, Send, X, CheckCheck, Utensils, PieChart
} from 'lucide-react';
import BulkImport from '@/components/BulkImport';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [allGuests, setAllGuests] = useState<any[]>([]); // Full unpaginated list for accurate summary stats
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [subGuestName, setSubGuestName] = useState('');
  
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [invitedEvents, setInvitedEvents] = useState<string[]>([]);
  const [addingGuest, setAddingGuest] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error || !data) { router.push('/dashboard'); return; }
      setEvent(data);
      if (data.itinerary) {
        setInvitedEvents(data.itinerary.map((i: any) => i.id));
      }
    };
    fetchEvent();
  }, [eventId, router]);

  useEffect(() => { 
    fetchPaginatedGuests();
    fetchAllGuestsForSummary(); // Grab the full list separately for accurate math
  }, [eventId, currentPage, pageSize]);

  const fetchPaginatedGuests = async () => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('guests')
      .select(`*, sub_guests (*)`, { count: 'exact' })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) setGuests(data);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  };

  // Needed to calculate summary statistics across ALL pages, not just the current page
  const fetchAllGuestsForSummary = async () => {
    const { data } = await supabase
      .from('guests')
      .select(`*, sub_guests (*)`)
      .eq('event_id', eventId);
    if (data) setAllGuests(data);
  };

  const formatPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ''); 
    if (cleaned.startsWith('0')) cleaned = '94' + cleaned.substring(1); 
    return cleaned;
  };

  const markAsSent = async (guestId: string) => {
    const { error } = await supabase.from('guests').update({ invitation_sent: true }).eq('id', guestId);
    if (!error) setGuests(prev => prev.map(g => g.id === guestId ? { ...g, invitation_sent: true } : g));
  };

  const getWhatsAppUrl = (guest: any) => {
    const baseUrl = window.location.origin;
    const message = `Hello ${guest.first_name}!  \n\nWe are excited to invite you to *${event?.title}*.\n\nPlease view your invitation and RSVP here:\n${baseUrl}/v/${event?.slug}?guest=${guest.access_token}`;
    return `https://wa.me/${formatPhone(guest.phone)}?text=${encodeURIComponent(message)}`;
  };

  const handleManualCopy = (guest: any) => {
    const url = `${window.location.origin}/v/${event?.slug}?guest=${guest.access_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerWhatsApp = (guest: any) => {
    if (!guest.phone) return alert("Missing Phone Number");
    markAsSent(guest.id);
    window.open(getWhatsAppUrl(guest), '_blank');
  };

  const handleSelectGuest = (id: string) => {
    setSelectedGuestIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedGuestIds(selectedGuestIds.length === guests.length ? [] : guests.map(g => g.id));
  };

  const toggleInviteEvent = (id: string) => {
    setInvitedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleAddPrimaryGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingGuest(true);

    const { error } = await supabase.from('guests').insert([{
      event_id: eventId, 
      first_name: newGuestName, 
      phone: newGuestPhone, 
      is_attending: false, 
      invitation_sent: false,
      invited_events: invitedEvents,
      dietary_preference: 'Standard',
      attending_events: []
    }]);
    if (!error) { 
      fetchPaginatedGuests(); 
      fetchAllGuestsForSummary();
      setNewGuestName(''); 
      setNewGuestPhone(''); 
    }
    setAddingGuest(false);
  };

  const handleAddSubGuest = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!subGuestName.trim()) return;
    const { data } = await supabase.from('sub_guests').insert([{
      parent_guest_id: parentId, full_name: subGuestName, is_attending: false, dietary_preference: 'Standard', attending_events: []
    }]).select();
    if (data) {
      setGuests(guests.map(g => g.id === parentId ? { ...g, sub_guests: [...(g.sub_guests || []), data[0]] } : g));
      fetchAllGuestsForSummary();
      setSubGuestName(''); setActiveGuestId(null);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (confirm("Permanently delete guest?")) {
      await supabase.from('guests').delete().eq('id', guestId);
      fetchPaginatedGuests();
      fetchAllGuestsForSummary();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // ── Calculate Summary Metrics ──
  const getSummaryStats = () => {
    const summary = {
      totalGuests: 0,
      totalConfirmed: 0,
      events: {} as Record<string, { invited: number, confirmed: number }>,
      dietary: { Standard: 0, Vegetarian: 0, Vegan: 0, Halal: 0, Allergies: 0 } as Record<string, number>
    };

    // Initialize Event Counters
    event?.itinerary?.forEach((item: any) => {
      summary.events[item.id] = { invited: 0, confirmed: 0 };
    });

    allGuests.forEach(guest => {
      summary.totalGuests += 1;
      
      // Count primary guest event invitations and confirmations
      guest.invited_events?.forEach((evId: string) => {
        if (summary.events[evId]) summary.events[evId].invited += 1;
      });
      if (guest.is_attending) {
        summary.totalConfirmed += 1;
        guest.attending_events?.forEach((evId: string) => {
          if (summary.events[evId]) summary.events[evId].confirmed += 1;
        });
        if (event?.ask_dietary && guest.dietary_preference) {
          summary.dietary[guest.dietary_preference] = (summary.dietary[guest.dietary_preference] || 0) + 1;
        }
      }

      // Count sub-guests
      guest.sub_guests?.forEach((sub: any) => {
        summary.totalGuests += 1;
        // Sub-guests implicitly have the same invites as their parent
        guest.invited_events?.forEach((evId: string) => {
          if (summary.events[evId]) summary.events[evId].invited += 1;
        });
        if (sub.is_attending) {
          summary.totalConfirmed += 1;
          sub.attending_events?.forEach((evId: string) => {
            if (summary.events[evId]) summary.events[evId].confirmed += 1;
          });
          if (event?.ask_dietary && sub.dietary_preference) {
            summary.dietary[sub.dietary_preference] = (summary.dietary[sub.dietary_preference] || 0) + 1;
          }
        }
      });
    });

    return summary;
  };

  const stats = getSummaryStats();

  if (loading || !event) return (
    <div className="flex flex-col items-center justify-center py-32 opacity-50">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#B8905B] rounded-full animate-spin mb-6"></div>
      <p className="text-[#B8905B] text-[10px] font-black tracking-[0.3em] uppercase">Loading Roster</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto text-zinc-300 relative">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* ── Batch Dispatch Modal ── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-md w-full p-10 shadow-2xl relative">
            <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X /></button>
            <h3 className="text-xl font-serif text-white mb-2 italic tracking-tight">Batch Dispatch</h3>
            <p className="text-[10px] font-bold text-zinc-500 mb-8 uppercase tracking-[0.3em]">Queue: {bulkIndex + 1} / {selectedGuestIds.length}</p>
            
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 mb-10 shadow-inner">
              <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-3">Next Recipient</p>
              <p className="text-3xl font-serif text-white tracking-tighter truncate">{guests.find(g => g.id === selectedGuestIds[bulkIndex])?.first_name}</p>
              <p className="text-sm text-[#B8905B] font-mono mt-2 tracking-widest">{guests.find(g => g.id === selectedGuestIds[bulkIndex])?.phone}</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  const g = guests.find(g => g.id === selectedGuestIds[bulkIndex]);
                  triggerWhatsApp(g);
                  if (bulkIndex < selectedGuestIds.length - 1) setBulkIndex(bulkIndex + 1);
                  else { setIsBulkModalOpen(false); setSelectedGuestIds([]); }
                }}
                className="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 uppercase text-[10px] tracking-widest"
              >
                <Send className="w-4 h-4" /> Open WhatsApp & Next
              </button>
              <button onClick={() => bulkIndex < selectedGuestIds.length - 1 ? setBulkIndex(bulkIndex + 1) : setIsBulkModalOpen(false)} className="w-full py-2 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">Skip Guest</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Summary Drawer ── */}
      {isSummaryDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSummaryDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-zinc-800 flex flex-col shadow-2xl animate-slide-in-right overflow-y-auto">
            
            <div className="flex items-center justify-between p-8 border-b border-zinc-800/60 bg-zinc-950/50">
               <div>
                 <h2 className="text-2xl font-serif text-white tracking-tight">Event Summary</h2>
                 <p className="text-[10px] text-[#B8905B] uppercase tracking-widest mt-1 font-bold">Real-time Analytics</p>
               </div>
               <button onClick={() => setIsSummaryDrawerOpen(false)} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                 <X className="w-5 h-5"/>
               </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Grand Totals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl text-center">
                  <p className="text-4xl font-light text-white mb-1">{stats.totalGuests}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Expected Guests</p>
                </div>
                <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-2xl text-center">
                  <p className="text-4xl font-light text-green-400 mb-1">{stats.totalConfirmed}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500/80">Total Confirmed</p>
                </div>
              </div>

              {/* Sub-Event Breakdown */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-800 pb-2">Sub-Event Breakdown</h3>
                <div className="space-y-4">
                  {event.itinerary?.map((item: any) => {
                    const eventStats = stats.events[item.id] || { invited: 0, confirmed: 0 };
                    const progress = eventStats.invited > 0 ? (eventStats.confirmed / eventStats.invited) * 100 : 0;
                    
                    return (
                      <div key={item.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          <span className="text-[10px] font-black text-[#B8905B] uppercase">{eventStats.confirmed} / {eventStats.invited} Confirmed</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#B8905B] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Requirements */}
              {event.ask_dietary && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2"><Utensils className="w-3.5 h-3.5"/> Dietary Requirements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(stats.dietary).map(([diet, count]) => (
                      <div key={diet} className="bg-black/40 border border-zinc-800/50 px-4 py-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-zinc-300">{diet}</span>
                        <span className={`text-sm font-bold ${diet !== 'Standard' && count > 0 ? 'text-orange-400' : 'text-zinc-500'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Professional Breadcrumb & Header */}
      <div className="mb-10">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-[#B8905B] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-4xl font-serif text-white tracking-tight mb-3">{event?.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-[#B8905B]"><CheckCircle2 className="w-3.5 h-3.5" /> {event?.itinerary?.length || 0} Sub-Events Scheduled</span>
              {!event?.ask_dietary && <span className="flex items-center gap-2 text-orange-400"><Utensils className="w-3.5 h-3.5" /> Dietary Requests Disabled</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSummaryDrawerOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:border-zinc-600 transition-all shadow-sm">
              <PieChart className="w-3.5 h-3.5" /> Summary
            </button>
            <BulkImport eventId={eventId} onSuccess={() => { fetchPaginatedGuests(); fetchAllGuestsForSummary(); }} />
          </div>
        </div>
      </div>

      {/* Guest Registration Bar */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl mb-10 flex flex-col md:flex-row gap-6 items-start md:items-end shadow-lg">
        <div className="flex-1 w-full">
          <label className="block text-[9px] text-zinc-500 mb-2 uppercase font-black tracking-widest">Primary Guest Name</label>
          <input type="text" required value={newGuestName} onChange={e => setNewGuestName(e.target.value)} placeholder="e.g. Mr. & Mrs. Perera" className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all text-sm" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-[9px] text-zinc-500 mb-2 uppercase font-black tracking-widest">WhatsApp Number</label>
          <input type="text" value={newGuestPhone} onChange={e => setNewGuestPhone(e.target.value)} placeholder="077 123 4567" className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all text-sm font-mono" />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="block text-[9px] text-zinc-500 uppercase font-black tracking-widest">Event Access</label>
          <div className="flex flex-wrap items-center gap-4 py-2">
             {event?.itinerary?.map((item: any) => (
               <label key={item.id} className="flex items-center gap-2 text-xs text-white cursor-pointer hover:text-[#B8905B] transition-colors">
                 <input type="checkbox" checked={invitedEvents.includes(item.id)} onChange={() => toggleInviteEvent(item.id)} className="accent-[#B8905B] w-3.5 h-3.5" /> 
                 {item.name}
               </label>
             ))}
          </div>
        </div>
        <button onClick={handleAddPrimaryGuest} disabled={addingGuest || newGuestName === '' || invitedEvents.length === 0} className="px-8 py-3 bg-[#B8905B] text-[#121110] font-black rounded-xl h-[46px] uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shrink-0 flex items-center gap-2 disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> Add Guest
        </button>
      </div>

      {/* List Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif text-white">Guest Ledger</h2>
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-black uppercase tracking-widest text-zinc-500">Total: {totalCount}</span>
          
          {selectedGuestIds.length > 0 && (
            <button onClick={() => { setBulkIndex(0); setIsBulkModalOpen(true); }} className="bg-green-900/80 text-green-100 border border-green-700/50 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-green-600 transition-all animate-fade-up">
              <Send className="w-3.5 h-3.5" /> Dispatch {selectedGuestIds.length} Links
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><TableIcon className="w-4 h-4" /></button>
          </div>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-400 px-3 py-2 rounded-lg outline-none cursor-pointer">
            <option value={10}>10 Rows</option>
            <option value={25}>25 Rows</option>
            <option value={50}>50 Rows</option>
          </select>
        </div>
      </div>

      {/* Main Content Render */}
      {viewMode === 'table' ? (
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 text-zinc-500 border-b border-zinc-800 uppercase text-[9px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5 w-10"><input type="checkbox" checked={selectedGuestIds.length === guests.length && guests.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-zinc-700 bg-black accent-[#B8905B] cursor-pointer" /></th>
                <th className="px-4 py-5">Primary Contact</th>
                <th className="px-4 py-5">Household / Plus Ones</th>
                <th className="px-4 py-5 text-center">RSVP</th>
                <th className="px-4 py-5 text-center">Dispatch</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {guests.map((guest) => (
                <tr key={guest.id} className={`transition-colors ${selectedGuestIds.includes(guest.id) ? 'bg-[#B8905B]/5' : 'hover:bg-zinc-800/20'}`}>
                  <td className="px-6 py-6 align-top"><input type="checkbox" checked={selectedGuestIds.includes(guest.id)} onChange={() => handleSelectGuest(guest.id)} className="w-4 h-4 rounded border-zinc-700 bg-black accent-[#B8905B] cursor-pointer" /></td>
                  <td className="px-4 py-6 align-top">
                    <div className="font-serif text-white flex items-center gap-2 text-xl tracking-tight">
                      {guest.first_name} {guest.is_attending && <Check className="w-4 h-4 text-green-500 stroke-[3px]" />}
                    </div>
                    {event?.ask_dietary && guest.dietary_preference && guest.dietary_preference !== 'Standard' && guest.is_attending && (
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[8px] bg-orange-950/40 text-orange-400 border border-orange-900/50 uppercase tracking-widest font-black"><Utensils className="w-2 h-2"/> {guest.dietary_preference}</span>
                    )}
                    <div className="text-[#B8905B] text-xs font-mono mt-1 tracking-wider">{guest.phone || 'N/A'}</div>
                    <div className="mt-2 text-[8px] flex gap-1 uppercase tracking-widest text-zinc-600 flex-wrap max-w-[200px]">
                      {guest.invited_events?.map((evId: string) => {
                         const match = event?.itinerary?.find((i:any) => i.id === evId);
                         const isAttending = guest.is_attending && guest.attending_events?.includes(evId);
                         if (!match) return null;
                         return isAttending 
                           ? <span key={`att-${evId}`} className="bg-green-950/40 border border-green-900/50 text-green-400 px-1.5 py-0.5 rounded mb-1 flex items-center gap-1"><Check className="w-2 h-2"/>{match.name}</span>
                           : <span key={`inv-${evId}`} className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded mb-1">{match.name}</span>;
                      })}
                    </div>
                    <button onClick={() => handleManualCopy(guest)} className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all border ${copiedId === guest.id ? 'bg-green-950/40 border-green-800 text-green-400' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'}`}>
                      {copiedId === guest.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copiedId === guest.id ? 'URL Copied' : 'Copy Link'}
                    </button>
                  </td>
                  <td className="px-4 py-6 align-top">
                    <div className="space-y-2">
                      {guest.sub_guests?.map((sub: any) => (
                        <div key={sub.id} className="flex flex-col bg-black/40 border border-zinc-800/50 px-3 py-2 rounded-lg w-64 shadow-inner">
                          <div className="flex items-center gap-3">
                            <Check className={`w-3.5 h-3.5 ${sub.is_attending ? 'text-green-500' : 'text-zinc-800'}`} /> 
                            <span className="text-xs font-medium text-zinc-400 truncate">{sub.full_name}</span>
                          </div>
                          {event?.ask_dietary && sub.dietary_preference && sub.dietary_preference !== 'Standard' && sub.is_attending && (
                            <span className="ml-6 mt-1 text-[8px] text-orange-400 font-bold uppercase tracking-widest">{sub.dietary_preference}</span>
                          )}
                          <div className="ml-6 mt-1.5 text-[8px] flex gap-1 uppercase tracking-widest flex-wrap">
                            {sub.attending_events?.map((evId: string) => {
                               const match = event?.itinerary?.find((i:any) => i.id === evId);
                               return sub.is_attending && match ? <span key={`sub-att-${evId}`} className="text-green-500">• {match.name}</span> : null;
                            })}
                          </div>
                        </div>
                      ))}
                      {activeGuestId === guest.id ? (
                        <form onSubmit={(e) => handleAddSubGuest(e, guest.id)} className="flex items-center gap-2 mt-3">
                          <input type="text" autoFocus value={subGuestName} onChange={e => setSubGuestName(e.target.value)} className="bg-black border border-zinc-700 px-3 py-1.5 rounded-md text-xs outline-none focus:border-[#B8905B] w-48 text-white" placeholder="Name..." />
                          <button type="submit" className="text-[#B8905B] text-[10px] font-black uppercase bg-[#B8905B]/10 px-3 py-1.5 rounded-md hover:bg-[#B8905B]/20 transition-colors">Add</button>
                          <button type="button" onClick={() => setActiveGuestId(null)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
                        </form>
                      ) : (
                        <button onClick={() => setActiveGuestId(guest.id)} className="text-[9px] font-black text-zinc-500 hover:text-[#B8905B] mt-2 tracking-[0.2em] border border-dashed border-zinc-800 px-3 py-1.5 rounded-md transition-all uppercase flex items-center gap-1"><Plus className="w-3 h-3"/> Family Member</button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-6 align-top text-center">
                    <span className={`px-2.5 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest ${guest.rsvp_status === 'confirmed' ? 'bg-green-950/20 text-green-400 border-green-900/50' : guest.rsvp_status === 'declined' ? 'bg-red-950/20 text-red-400 border-red-900/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                      {guest.rsvp_status}
                    </span>
                  </td>
                  <td className="px-4 py-6 align-top text-center">
                    {guest.invitation_sent ? <CheckCheck className="w-5 h-5 text-green-500 mx-auto" /> : <Clock className="w-4 h-4 text-zinc-700 mx-auto" />}
                  </td>
                  <td className="px-6 py-6 align-top text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => triggerWhatsApp(guest)} className={`p-2.5 rounded-lg border transition-all ${guest.invitation_sent ? 'bg-black text-zinc-600 border-zinc-800 hover:border-[#B8905B] hover:text-[#B8905B]' : 'bg-green-900/20 text-green-500 border-green-900/30 hover:bg-green-900/40'}`}><MessageSquare className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteGuest(guest.id)} className="p-2.5 bg-black border border-zinc-800 text-zinc-600 hover:text-red-500 transition-all rounded-lg hover:border-red-900/50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {guests.map((guest) => (
            <div key={guest.id} className={`bg-zinc-900/30 border p-6 rounded-2xl transition-all relative group flex flex-col shadow-xl ${selectedGuestIds.includes(guest.id) ? 'border-[#B8905B] ring-1 ring-[#B8905B]/50' : 'border-zinc-800/80 hover:border-zinc-700'}`}>
              <input type="checkbox" checked={selectedGuestIds.includes(guest.id)} onChange={() => handleSelectGuest(guest.id)} className="absolute top-6 right-6 w-4 h-4 rounded border-zinc-700 bg-black accent-[#B8905B] cursor-pointer z-10" />
              
              <div className="mb-6 pr-10 text-zinc-100">
                <h3 className="text-2xl font-serif tracking-tight flex items-center gap-2">
                  {guest.first_name} {guest.is_attending && <Check className="w-5 h-5 text-green-500 stroke-[3px]" />}
                </h3>
                {event?.ask_dietary && guest.dietary_preference && guest.dietary_preference !== 'Standard' && guest.is_attending && (
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[8px] bg-orange-950/40 text-orange-400 border border-orange-900/50 uppercase tracking-widest font-black"><Utensils className="w-2 h-2"/> {guest.dietary_preference}</span>
                )}
                <p className="text-[#B8905B] text-xs font-mono tracking-widest mt-2">{guest.phone || 'N/A'}</p>
                <div className="mt-3 text-[8px] flex gap-1 uppercase tracking-widest flex-wrap">
                  {guest.invited_events?.map((evId: string) => {
                      const match = event?.itinerary?.find((i:any) => i.id === evId);
                      const isAttending = guest.is_attending && guest.attending_events?.includes(evId);
                      if (!match) return null;
                      return isAttending 
                        ? <span key={`att-${evId}`} className="bg-green-950/40 border border-green-900/50 text-green-400 px-1.5 py-0.5 rounded mb-1 flex items-center gap-1"><Check className="w-2 h-2"/>{match.name}</span>
                        : <span key={`inv-${evId}`} className="bg-zinc-950 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded mb-1">{match.name}</span>;
                  })}
                </div>
              </div>
              
              <div className="flex-1 space-y-5 mb-6">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest ${guest.rsvp_status === 'confirmed' ? 'bg-green-950/20 text-green-400 border-green-900/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>{guest.rsvp_status}</span>
                  {guest.invitation_sent && <span className="text-green-500 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"><CheckCheck className="w-3 h-3"/> Sent</span>}
                </div>
                
                <div className="space-y-2">
                  {guest.sub_guests?.map((sub: any) => (
                    <div key={sub.id} className="text-xs text-zinc-400 flex flex-col bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <Check className={`w-3.5 h-3.5 ${sub.is_attending ? 'text-green-500' : 'text-zinc-800'}`} /> {sub.full_name}
                      </div>
                      {event?.ask_dietary && sub.dietary_preference && sub.dietary_preference !== 'Standard' && sub.is_attending && (
                         <span className="ml-6 mt-1 text-[8px] text-orange-400 font-bold uppercase tracking-widest">{sub.dietary_preference}</span>
                      )}
                      <div className="ml-6 mt-1.5 text-[8px] flex gap-1 uppercase tracking-widest flex-wrap">
                        {sub.attending_events?.map((evId: string) => {
                            const match = event?.itinerary?.find((i:any) => i.id === evId);
                            return sub.is_attending && match ? <span key={`sub-att-${evId}`} className="text-green-500">• {match.name}</span> : null;
                        })}
                      </div>
                    </div>
                  ))}
                  {activeGuestId === guest.id ? (
                    <form onSubmit={(e) => handleAddSubGuest(e, guest.id)} className="mt-3 flex gap-2">
                      <input type="text" autoFocus value={subGuestName} onChange={e => setSubGuestName(e.target.value)} className="bg-black border border-zinc-800 px-3 py-2 text-xs rounded-lg flex-1 outline-none focus:border-[#B8905B] text-white" placeholder="Name..." />
                      <button type="submit" className="text-[#B8905B] text-[10px] font-black uppercase bg-[#B8905B]/10 px-3 rounded-lg hover:bg-[#B8905B]/20 transition-colors">Add</button>
                    </form>
                  ) : (
                    <button onClick={() => setActiveGuestId(guest.id)} className="text-[9px] text-zinc-500 hover:text-[#B8905B] transition-all font-black uppercase tracking-widest mt-2 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Member</button>
                  )}
                </div>
              </div>
              
              <div className="pt-5 border-t border-zinc-800/60 flex items-center justify-between gap-3">
                <button onClick={() => triggerWhatsApp(guest)} className="flex-1 bg-black border border-zinc-800 text-zinc-400 py-2.5 rounded-lg hover:text-green-500 hover:border-green-900/50 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"><MessageSquare className="w-3.5 h-3.5" /> WA</button>
                <button onClick={() => handleManualCopy(guest)} className="flex-1 bg-black border border-zinc-800 text-zinc-400 py-2.5 rounded-lg hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"><Copy className="w-3.5 h-3.5" /> Link</button>
                <button onClick={() => handleDeleteGuest(guest.id)} className="p-2.5 bg-black border border-zinc-800 text-zinc-600 hover:text-red-500 transition-all rounded-lg hover:border-red-900/50"><Trash2 className="w-4 h-4" /></button>
              </div>
              {copiedId === guest.id && <p className="absolute bottom-20 right-6 text-[9px] text-[#B8905B] font-black uppercase tracking-widest bg-black px-2 py-1 rounded border border-[#B8905B]/30 shadow-lg">Copied!</p>}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 border border-zinc-800 rounded-lg hover:bg-zinc-900 disabled:opacity-20 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 text-xs font-bold rounded-lg transition-all ${currentPage === page ? 'bg-white text-black' : 'text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white'}`}>
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 border border-zinc-800 rounded-lg hover:bg-zinc-900 disabled:opacity-20 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}