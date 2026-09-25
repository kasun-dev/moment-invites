'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { INVITATION_TEMPLATES } from '@/components/templates/registry';
import { 
  Calendar, MapPin, LayoutGrid, Table as TableIcon, Plus, 
  CheckCircle2, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, Settings2
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

  // Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [slug, setSlug] = useState('');
  const [templateId, setTemplateId] = useState('classic');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTemplateId, setEditTemplateId] = useState('');

  useEffect(() => { fetchEvents(); }, [currentPage, pageSize]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { router.push('/login'); return; }
    setUser(user);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('events')
      .select(`*, guests (id, rsvp_status, is_attending, sub_guests ( id, is_attending ))`, { count: 'exact' })
      .eq('owner_id', user.id)
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from('events').insert([{
      owner_id: user.id, title, event_date: new Date(date).toISOString(), location, slug: slug.toLowerCase().replace(/\s+/g, '-'), template_id: templateId, status: 'active'
    }]);
    if (error) alert(`Error: ${error.message}`);
    else { fetchEvents(); setShowNewEventForm(false); setTitle(''); setDate(''); setLocation(''); setSlug(''); }
    setCreating(false);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete the event and all guest data permanently.")) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const startEditing = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    setEditingId(event.id);
    setEditTitle(event.title);
    setEditDate(new Date(event.event_date).toISOString().slice(0, 16));
    setEditLocation(event.location);
    setEditTemplateId(event.template_id);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('events').update({ title: editTitle, event_date: new Date(editDate).toISOString(), location: editLocation, template_id: editTemplateId }).eq('id', editingId);
    if (!error) { setEditingId(null); fetchEvents(); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-6xl mx-auto text-zinc-300">
      
      {/* Professional Page Header */}
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

      {showNewEventForm && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 mb-10 shadow-2xl animate-fade-up">
          <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2"><Settings2 className="w-5 h-5 text-[#B8905B]"/> Configure New Event</h3>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">Theme Architecture</label>
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
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2">Auspicious Date & Time</label>
              <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2">Location / Venue</label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Colombo" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8905B] transition-all" />
            </div>
            <div className="md:col-span-2 pt-4 flex justify-end border-t border-zinc-800/50">
              <button type="submit" disabled={creating} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 hover:bg-zinc-200 shadow-xl">
                {creating ? 'Deploying...' : 'Deploy Event Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <div key={event.id} onClick={() => editingId !== event.id && router.push(`/dashboard/events/${event.id}`)} className={`bg-zinc-900/40 border p-6 rounded-2xl transition-all group flex flex-col h-full shadow-lg ${editingId === event.id ? 'border-[#B8905B] ring-1 ring-[#B8905B]/50 bg-zinc-900' : 'border-zinc-800/80 hover:border-zinc-600 cursor-pointer hover:bg-zinc-900/80 hover:-translate-y-1'}`}>
                  {editingId === event.id ? (
                    <form onSubmit={handleUpdateEvent} className="space-y-4">
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-black border border-zinc-700 p-2.5 rounded-lg text-sm text-white outline-none focus:border-[#B8905B]" />
                      <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-black border border-zinc-700 p-2.5 rounded-lg text-sm text-white outline-none [color-scheme:dark]" />
                      <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-black border border-zinc-700 p-2.5 rounded-lg text-sm text-white outline-none" />
                      <select value={editTemplateId} onChange={e => setEditTemplateId(e.target.value)} className="w-full bg-black border border-zinc-700 p-2.5 rounded-lg text-sm text-white outline-none">
                        {INVITATION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-[#B8905B] text-[#121110] py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"><Save className="w-3.5 h-3.5" /> Save</button>
                        <button type="button" onClick={(e) => {e.stopPropagation(); setEditingId(null);}} className="flex-1 bg-zinc-800 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-700 text-white transition-colors"><X className="w-3.5 h-3.5" /> Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 mb-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-serif text-white group-hover:text-[#B8905B] transition-colors truncate pr-2">{event.title}</h3>
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => startEditing(e, event)} className="p-2 bg-zinc-800/80 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-2 bg-zinc-800/80 rounded-lg hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-zinc-400"><Calendar className="w-4 h-4 text-zinc-600" /><span>{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                          <div className="flex items-center gap-3 text-sm text-zinc-400"><MapPin className="w-4 h-4 text-zinc-600" /><span>{event.location}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/60 bg-black/20 -mx-6 -mb-6 p-6 rounded-b-2xl">
                        <div className="text-center"><p className="text-2xl font-light text-white mb-1">{event.stats.invitations}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500">Links Sent</p></div>
                        <div className="text-center border-x border-zinc-800/60"><p className="text-2xl font-light text-white mb-1">{event.stats.totalGuests}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500">Expected</p></div>
                        <div className="text-center"><p className="text-2xl font-light text-[#B8905B] mb-1">{event.stats.confirmedHeads}</p><p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#B8905B]/80">Confirmed</p></div>
                      </div>
                    </>
                  )}
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
                    <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        {editingId === event.id ? (
                          <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-black border border-zinc-700 p-2 rounded text-sm w-full text-white" />
                        ) : (
                          <div>
                            <p className="font-serif text-lg text-white mb-1">{event.title}</p>
                            <p className="text-xs text-zinc-500 font-mono">{new Date(event.event_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {editingId === event.id ? (
                          <select value={editTemplateId} onChange={e => setEditTemplateId(e.target.value)} className="bg-black border border-zinc-700 p-2 rounded text-xs text-white">
                            {INVITATION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        ) : (
                          <span className="px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-[#B8905B]">{event.template_id}</span>
                        )}
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
                          {editingId === event.id ? (
                            <>
                              <button onClick={handleUpdateEvent} className="p-2 bg-green-900/20 text-green-400 rounded hover:bg-green-900/40"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => router.push(`/dashboard/events/${event.id}`)} className="text-[#121110] bg-[#B8905B] hover:bg-white font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-[10px] transition-colors">Manage</button>
                              <button onClick={(e) => startEditing(e, event)} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                              <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
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
    </div>
  );
}