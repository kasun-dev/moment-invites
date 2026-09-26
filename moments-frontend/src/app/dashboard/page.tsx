'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { INVITATION_TEMPLATES } from '@/components/templates/registry';
import { 
  Calendar, MapPin, LayoutGrid, Table as TableIcon, Plus, 
  CheckCircle2, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, Settings2, Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  // ── Create Form States ──
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [templateId, setTemplateId] = useState('classic');
  const [askDietary, setAskDietary] = useState(true);
  const [creating, setCreating] = useState(false);
  const [itinerary, setItinerary] = useState([{ id: Date.now().toString(), name: 'Poruwa Ceremony', date: '', time: '', location: '' }]);

  // ── Edit Form States (Drawer) ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editTemplateId, setEditTemplateId] = useState('');
  const [editAskDietary, setEditAskDietary] = useState(true);
  const [editItinerary, setEditItinerary] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchEvents(); }, [currentPage, pageSize]);

  const fetchEvents = async () => {
    setLoading(true);
    
    // ── FIX: Use getSession() instead of getUser() to prevent Web Lock collisions ──
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) { router.push('/login'); return; }
    setUser(session.user);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('events')
      .select(`*, guests (id, rsvp_status, is_attending, sub_guests ( id, is_attending ))`, { count: 'exact' })
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      const eventsWithStats = data.map((event) => {
        const invitations = event.guests?.length || 0;
        let totalGuests = invitations;
        let confirmedHeads = 0;
        event.guests?.forEach((guest: any) => {
          if (guest.sub_guests) totalGuests += guest.sub_guests.length;
          if (guest.rsvp_status === 'confirmed') {
            if (guest.is_attending) confirmedHeads += 1;
            guest.sub_guests?.forEach((sg: any) => { if (sg.is_attending) confirmedHeads += 1; });
          }
        });
        return { ...event, stats: { invitations, totalGuests, confirmedHeads } };
      });
      setEvents(eventsWithStats);
      if (count !== null) setTotalCount(count);
    }
    setLoading(false);
  };

  // ── Create Event Handlers ──
  const handleAddItineraryItem = () => setItinerary([...itinerary, { id: Date.now().toString(), name: 'Reception', date: '', time: '', location: '' }]);
  const handleRemoveItineraryItem = (id: string) => { if (itinerary.length > 1) setItinerary(itinerary.filter(item => item.id !== id)); };
  const handleItineraryChange = (id: string, field: string, value: string) => setItinerary(itinerary.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const primaryDate = itinerary.length > 0 ? itinerary[0].date : new Date().toISOString();

    const { error } = await supabase.from('events').insert([{
      owner_id: user.id, title, slug: slug.toLowerCase().replace(/\s+/g, '-'), template_id: templateId, status: 'active', itinerary: itinerary, event_date: primaryDate, ask_dietary: askDietary
    }]);

    if (error) alert(`Error: ${error.message}`);
    else { 
      fetchEvents(); setShowNewEventForm(false); setTitle(''); setSlug(''); setAskDietary(true);
      setItinerary([{ id: Date.now().toString(), name: 'Poruwa Ceremony', date: '', time: '', location: '' }]); 
    }
    setCreating(false);
  };

  // ── Edit Event Handlers (Drawer) ──
  const startEditing = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    setEditingId(event.id);
    setEditTitle(event.title);
    setEditSlug(event.slug || '');
    setEditTemplateId(event.template_id);
    setEditAskDietary(event.ask_dietary ?? true);
    setEditItinerary(event.itinerary?.length > 0 ? event.itinerary : [{ id: Date.now().toString(), name: 'Poruwa Ceremony', date: '', time: '', location: '' }]);
  };

  const handleAddEditItineraryItem = () => setEditItinerary([...editItinerary, { id: Date.now().toString(), name: 'Reception', date: '', time: '', location: '' }]);
  const handleRemoveEditItineraryItem = (id: string) => { if (editItinerary.length > 1) setEditItinerary(editItinerary.filter(item => item.id !== id)); };
  const handleEditItineraryChange = (id: string, field: string, value: string) => setEditItinerary(editItinerary.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const primaryDate = editItinerary.length > 0 ? editItinerary[0].date : new Date().toISOString();

    const { error } = await supabase.from('events').update({ 
      title: editTitle, 
      slug: editSlug, 
      template_id: editTemplateId, 
      ask_dietary: editAskDietary, 
      itinerary: editItinerary, 
      event_date: primaryDate 
    }).eq('id', editingId);

    setUpdating(false);
    if (!error) { setEditingId(null); fetchEvents(); }
    else alert(`Update failed: ${error.message}`);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete the event and all guest data permanently.")) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

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

      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Active Events</h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">Manage your {totalCount} deployed invitations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-inner">
            <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><TableIcon className="w-4 h-4" /></button>
          </div>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 px-3 py-2.5 rounded-lg outline-none focus:border-zinc-500 cursor-pointer">
            <option value={9}>9 / page</option>
            <option value={15}>15 / page</option>
            <option value={30}>30 / page</option>
          </select>
          <button onClick={() => setShowNewEventForm(!showNewEventForm)} className="px-5 py-2.5 bg-[#B8905B] hover:bg-[#a67e49] text-[#121110] font-bold uppercase tracking-widest text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#B8905B]/20">
            {showNewEventForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showNewEventForm ? 'Close' : 'New Event'}
          </button>
        </div>
      </div>

      {/* New Event Form (Top Section) */}
      {showNewEventForm && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 mb-10 shadow-2xl animate-fade-up">
          <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2"><Settings2 className="w-5 h-5 text-[#B8905B]"/> Configure New Event</h3>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Theme Architecture</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {INVITATION_TEMPLATES.map((t) => (
                  <div key={t.id} onClick={() => setTemplateId(t.id)} className={`cursor-pointer p-4 rounded-xl border transition-all text-center ${templateId === t.id ? 'bg-[#B8905B]/10 border-[#B8905B] text-[#B8905B]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">{t.name}</p>
                    <p className="text-[10px] opacity-70">{t.preview}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2">Event Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Kasun & Dewmi" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2">Unique URL Slug</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="kasun-dewmi-2026" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all" />
            </div>

            <div className="md:col-span-2 mt-4 pt-6 border-t border-zinc-800/50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#B8905B]">Event Itinerary</label>
                  <p className="text-xs text-zinc-500 mt-1">Add multiple events (Church, Poruwa, Reception) to generate segmented invitations.</p>
                </div>
                <button type="button" onClick={handleAddItineraryItem} className="text-xs font-bold uppercase tracking-widest text-[#B8905B] border border-[#B8905B]/30 hover:bg-[#B8905B]/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> Add Sub-Event
                </button>
              </div>

              <div className="space-y-4">
                {itinerary.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-5 bg-black/40 border border-zinc-800/80 rounded-xl relative group">
                    {itinerary.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItineraryItem(item.id)} className="absolute -top-3 -right-3 bg-red-950/80 text-red-500 border border-red-900/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                    )}
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Event Name</label>
                      <input type="text" required value={item.name} onChange={e => handleItineraryChange(item.id, 'name', e.target.value)} placeholder="e.g. Holy Matrimony" className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-[#B8905B]" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Date</label>
                      <input type="date" required value={item.date} onChange={e => handleItineraryChange(item.id, 'date', e.target.value)} className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-[#B8905B] [color-scheme:dark]" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Time (Nakath)</label>
                      <input type="text" value={item.time} onChange={e => handleItineraryChange(item.id, 'time', e.target.value)} placeholder="e.g. 09:05 AM" className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-[#B8905B]" />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Location / Venue</label>
                      <input type="text" required value={item.location} onChange={e => handleItineraryChange(item.id, 'location', e.target.value)} placeholder="e.g. Shangri-La, Colombo" className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-[#B8905B]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="askDietary" checked={askDietary} onChange={(e) => setAskDietary(e.target.checked)} className="w-4 h-4 accent-[#B8905B] rounded bg-zinc-900 border-zinc-700 cursor-pointer" />
                <label htmlFor="askDietary" className="text-xs text-zinc-300 font-bold uppercase tracking-widest cursor-pointer">Request Dietary Preferences from Guests</label>
              </div>
              <button type="submit" disabled={creating} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 hover:bg-zinc-200 shadow-xl w-full md:w-auto">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Deploying...</> : 'Deploy Event Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Events Render */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#B8905B] rounded-full animate-spin mb-6"></div>
          <p className="text-[#B8905B] text-[10px] font-black tracking-[0.3em] uppercase">Loading Workspace</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-32 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
          <p className="text-zinc-500 font-serif text-xl italic">No events currently deployed.</p>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} onClick={() => router.push(`/dashboard/events/${event.id}`)} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl transition-all group flex flex-col h-full shadow-lg hover:border-zinc-600 cursor-pointer hover:bg-zinc-900/80 hover:-translate-y-1">
                  <div className="flex-1 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-serif text-white group-hover:text-[#B8905B] transition-colors truncate pr-2">{event.title}</h3>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => startEditing(e, event)} className="p-2 bg-zinc-800/80 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-2 bg-zinc-800/80 rounded-lg hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {event.itinerary?.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3 py-1">
                            <span className="font-bold text-zinc-300">{item.name}</span>
                            <span className="text-xs">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                      {(event.itinerary?.length || 0) > 2 && <p className="text-xs text-zinc-500 font-bold italic">+ {(event.itinerary?.length || 0) - 2} more events</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/60 bg-black/20 -mx-6 -mb-6 p-6 rounded-b-2xl">
                    <div className="text-center"><p className="text-2xl font-light text-white mb-1">{event.stats.invitations}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500">Links Sent</p></div>
                    <div className="text-center border-x border-zinc-800/60"><p className="text-2xl font-light text-white mb-1">{event.stats.totalGuests}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500">Expected</p></div>
                    <div className="text-center"><p className="text-2xl font-light text-[#B8905B] mb-1">{event.stats.confirmedHeads}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#B8905B]/80">Confirmed</p></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 text-zinc-500 border-b border-zinc-800 uppercase text-[9px] font-black tracking-[0.2em]">
                  <tr><th className="px-6 py-5">Event Details</th><th className="px-6 py-5 text-center">Design</th><th className="px-6 py-5 text-center">RSVP Progress</th><th className="px-6 py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/events/${event.id}`)}>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-serif text-lg text-white mb-1">{event.title}</p>
                          <p className="text-xs text-zinc-500 font-mono">{event.itinerary?.length} Sub-Events Scheduled</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-[#B8905B]">{event.template_id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-6">
                          <div className="text-center"><span className="block text-lg text-white">{event.stats.invitations}</span><span className="text-[8px] uppercase tracking-widest text-zinc-500">Sent</span></div>
                          <div className="text-center"><span className="block text-lg text-white">{event.stats.totalGuests}</span><span className="text-[8px] uppercase tracking-widest text-zinc-500">Total</span></div>
                          <div className="text-center"><span className="block text-lg text-green-400">{event.stats.confirmedHeads}</span><span className="text-[8px] uppercase tracking-widest text-green-500/70">Yes</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/events/${event.id}`); }} className="text-[#121110] bg-[#B8905B] hover:bg-white font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-[10px] transition-colors">Manage</button>
                          <button onClick={(e) => startEditing(e, event)} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        </>
      )}

      {/* ── Slide-Over Edit Drawer Panel ── */}
      {editingId && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingId(null)} />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl h-full bg-[#0a0a0a] border-l border-zinc-800 flex flex-col shadow-2xl animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-zinc-800/60 bg-zinc-950/50">
               <div>
                 <h2 className="text-2xl font-serif text-white tracking-tight">Edit Event Configuration</h2>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">Update core details and itineraries</p>
               </div>
               <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                 <X className="w-5 h-5"/>
               </button>
            </div>
            
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
               <form id="edit-event-form" onSubmit={handleUpdateEvent} className="space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                     <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Event Title</label>
                     <input type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-sm text-white outline-none focus:border-[#B8905B] transition-colors" />
                   </div>
                   
                   <div>
                     <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">URL Slug</label>
                     <input type="text" required value={editSlug} onChange={e => setEditSlug(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-sm text-white outline-none focus:border-[#B8905B] transition-colors" />
                   </div>
                   
                   <div>
                     <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Theme Template</label>
                     <select value={editTemplateId} onChange={e => setEditTemplateId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-sm text-white outline-none focus:border-[#B8905B] transition-colors appearance-none">
                       {INVITATION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-zinc-800/50">
                   <div className="flex justify-between items-center mb-4">
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest font-bold text-[#B8905B]">Itinerary Schedule</label>
                       <p className="text-[10px] text-zinc-500 mt-1">Manage sub-events for this celebration.</p>
                     </div>
                     <button type="button" onClick={handleAddEditItineraryItem} className="text-[9px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1.5">
                       <Plus className="w-3.5 h-3.5" /> Add Segment
                     </button>
                   </div>

                   <div className="space-y-4">
                     {editItinerary.map((item) => (
                       <div key={item.id} className="bg-black/30 border border-zinc-800/80 p-5 rounded-xl relative group">
                         {editItinerary.length > 1 && (
                           <button type="button" onClick={() => handleRemoveEditItineraryItem(item.id)} className="absolute -top-3 -right-3 bg-red-950/80 text-red-500 border border-red-900/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <X className="w-3.5 h-3.5"/>
                           </button>
                         )}
                         
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                           <div className="md:col-span-12">
                             <input type="text" required value={item.name} onChange={e => handleEditItineraryChange(item.id, 'name', e.target.value)} placeholder="e.g. Poruwa Ceremony" className="w-full bg-transparent text-lg font-serif text-white outline-none mb-2 border-b border-zinc-800 pb-2 focus:border-[#B8905B] transition-colors" />
                           </div>
                           
                           <div className="md:col-span-4">
                             <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Date</label>
                             <input type="date" required value={item.date} onChange={e => handleEditItineraryChange(item.id, 'date', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white [color-scheme:dark] outline-none focus:border-[#B8905B] transition-colors" />
                           </div>
                           <div className="md:col-span-3">
                             <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Time</label>
                             <input type="text" value={item.time} onChange={e => handleEditItineraryChange(item.id, 'time', e.target.value)} placeholder="09:05 AM" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-[#B8905B] transition-colors" />
                           </div>
                           <div className="md:col-span-5">
                             <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Location / Venue</label>
                             <input type="text" required value={item.location} onChange={e => handleEditItineraryChange(item.id, 'location', e.target.value)} placeholder="Venue details" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-[#B8905B] transition-colors" />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="pt-6 border-t border-zinc-800/50">
                    <label className="flex items-center gap-3 cursor-pointer bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                      <input type="checkbox" checked={editAskDietary} onChange={e => setEditAskDietary(e.target.checked)} className="accent-[#B8905B] w-5 h-5 rounded bg-zinc-950 border-zinc-700"/>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest font-bold text-zinc-300">Request Dietary Information</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">Allows guests to specify Vegetarian, Halal, Allergies, etc.</span>
                      </div>
                    </label>
                 </div>
               </form>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 border-t border-zinc-800/80 bg-zinc-950 flex justify-end gap-3 shrink-0">
               <button type="button" onClick={() => setEditingId(null)} className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                 Cancel
               </button>
               <button type="submit" form="edit-event-form" disabled={updating} className="px-8 py-3.5 bg-[#B8905B] text-[#121110] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50">
                 {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                 {updating ? 'Saving...' : 'Save Configuration'}
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}