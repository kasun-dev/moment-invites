'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { INVITATION_TEMPLATES } from '@/components/templates/registry';
import { 
  Calendar, 
  MapPin, 
  LayoutGrid, 
  Table as TableIcon, 
  Plus, 
  Users, 
  Mail, 
  CheckCircle2, 
  Palette, 
  Pencil, 
  Trash2, 
  X, 
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Data State
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Default 9 for card grid (3x3)
  const [totalCount, setTotalCount] = useState(0);

  // UI State
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  
  // New Event Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [slug, setSlug] = useState('');
  const [templateId, setTemplateId] = useState('classic');
  const [creating, setCreating] = useState(false);

  // Edit Event State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTemplateId, setEditTemplateId] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [currentPage, pageSize]); // Re-fetch when page or size changes

  const fetchEvents = async () => {
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { router.push('/login'); return; }
    setUser(user);

    // Calculate range for pagination
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch data with count and range
    const { data, error, count } = await supabase
      .from('events')
      .select(`
        *, 
        guests (id, rsvp_status, is_attending, sub_guests ( id, is_attending ))
      `, { count: 'exact' })
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching events:", error);
    }

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
    const { data, error } = await supabase
      .from('events')
      .insert([{
        owner_id: user.id,
        title,
        event_date: new Date(date).toISOString(),
        location,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        template_id: templateId
      }])
      .select();

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      fetchEvents(); 
      setShowNewEventForm(false);
      setTitle(''); setDate(''); setLocation(''); setSlug('');
    }
    setCreating(false);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete the event and all guest data permanently.")) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert("Error deleting event");
    else fetchEvents();
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
    const { error } = await supabase
      .from('events')
      .update({
        title: editTitle,
        event_date: new Date(editDate).toISOString(),
        location: editLocation,
        template_id: editTemplateId
      })
      .eq('id', editingId);

    if (error) alert("Update failed");
    else { setEditingId(null); fetchEvents(); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-wider text-balance">WORKSPACE</h1>
            <p className="text-sm text-zinc-500 mt-1">Admin: {user?.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-sm text-zinc-400 hover:text-white transition-colors">Sign Out</button>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-zinc-200">Your Events</h2>
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-500">
              Total: {totalCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {/* Page Size Selector */}
             <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 px-2 py-1.5 rounded outline-none focus:border-zinc-600"
            >
              <option value={6}>6 per page</option>
              <option value={9}>9 per page</option>
              <option value={15}>15 per page</option>
              <option value={30}>30 per page</option>
            </select>

            <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-1">
              <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-sm transition-all ${viewMode === 'card' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-sm transition-all ${viewMode === 'table' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><TableIcon className="w-4 h-4" /></button>
            </div>

            <button onClick={() => setShowNewEventForm(!showNewEventForm)} className="px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-900 font-medium rounded-md transition-all h-[36px] flex items-center gap-2 text-sm">
              {showNewEventForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Event</>}
            </button>
          </div>
        </div>

        {showNewEventForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">Select Invitation Template</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INVITATION_TEMPLATES.map((t) => (
                    <div key={t.id} onClick={() => setTemplateId(t.id)} className={`cursor-pointer p-3 rounded-lg border transition-all text-center ${templateId === t.id ? 'bg-zinc-800 border-zinc-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                      <p className="text-xs font-semibold">{t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Event Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Kasun & Dewmi" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-100" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Unique URL Slug</label>
                <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="kasun-dewmi-2026" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-100" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Date</label>
                <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-100 [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Location / Venue</label>
                <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Colombo" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-100" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" disabled={creating} className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-md transition-all disabled:opacity-50">
                  {creating ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 text-sm tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500">No events found matching this page.</p>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className={`bg-zinc-900 border p-6 rounded-xl transition-all group flex flex-col h-full ${editingId === event.id ? 'border-zinc-400 ring-1 ring-zinc-400' : 'border-zinc-800 hover:border-zinc-600 cursor-pointer'}`} onClick={() => editingId !== event.id && router.push(`/dashboard/events/${event.id}`)}>
                    {editingId === event.id ? (
                      <form onSubmit={handleUpdateEvent} className="space-y-4">
                        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm text-white" />
                        <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm text-white [color-scheme:dark]" />
                        <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm text-white" />
                        <select value={editTemplateId} onChange={e => setEditTemplateId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm text-white">
                          {INVITATION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-zinc-200 text-zinc-900 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-white transition-colors"><Save className="w-3 h-3" /> Save</button>
                          <button type="button" onClick={(e) => {e.stopPropagation(); setEditingId(null);}} className="flex-1 bg-zinc-800 py-1.5 rounded text-xs flex items-center justify-center gap-1 hover:bg-zinc-700 transition-colors"><X className="w-3 h-3" /> Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-white truncate pr-2">{event.title}</h3>
                            <div className="flex gap-2 shrink-0">
                               <button onClick={(e) => startEditing(e, event)} className="p-1.5 bg-zinc-800/50 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                               <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-1.5 bg-zinc-800/50 rounded hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="text-sm text-zinc-500 space-y-2 mb-6">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-400 shrink-0" /><span>{new Date(event.event_date).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400 shrink-0" /><span>{event.location}</span></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-800/50">
                          <div className="text-center"><p className="text-xl font-light text-zinc-200">{event.stats.invitations}</p><p className="text-[10px] tracking-wider uppercase text-zinc-500">Invites</p></div>
                          <div className="text-center border-x border-zinc-800/50"><p className="text-xl font-light text-zinc-200">{event.stats.totalGuests}</p><p className="text-[10px] tracking-wider uppercase text-zinc-500">Heads</p></div>
                          <div className="text-center"><p className="text-xl font-light text-zinc-200">{event.stats.confirmedHeads}</p><p className="text-[10px] tracking-wider uppercase text-green-500/80">Confirmed</p></div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                    <tr><th className="px-6 py-4 font-medium">Event Name</th><th className="px-6 py-4 font-medium text-center">Template</th><th className="px-6 py-4 font-medium text-center">Invites</th><th className="px-6 py-4 font-medium text-center">Confirmed</th><th className="px-6 py-4 font-medium text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          {editingId === event.id ? (
                            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-zinc-950 border border-zinc-700 p-1.5 rounded text-sm w-full text-white" />
                          ) : (
                            <span className="font-medium text-zinc-200">{event.title}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                           {editingId === event.id ? (
                             <select value={editTemplateId} onChange={e => setEditTemplateId(e.target.value)} className="bg-zinc-950 border border-zinc-700 p-1.5 rounded text-xs text-white">
                                {INVITATION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                             </select>
                           ) : (
                             <span className="uppercase text-[10px] text-zinc-500 font-mono">{event.template_id}</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-300">{event.stats.invitations}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs border bg-green-950/50 text-green-400 border-green-900/50 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {event.stats.confirmedHeads}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             {editingId === event.id ? (
                               <>
                                 <button onClick={handleUpdateEvent} className="p-1.5 bg-green-900/20 text-green-400 rounded hover:bg-green-900/40"><Save className="w-4 h-4" /></button>
                                 <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"><X className="w-4 h-4" /></button>
                               </>
                             ) : (
                               <>
                                 <button onClick={() => router.push(`/dashboard/events/${event.id}`)} className="text-zinc-400 hover:text-white px-3 py-1 border border-zinc-700 rounded text-xs transition-colors">Manage</button>
                                 <button onClick={(e) => startEditing(e, event)} className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                                 <button onClick={(e) => handleDeleteEvent(e, event.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-6">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                Page {currentPage} of {totalPages || 1}
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-zinc-800 rounded hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Generate Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs rounded transition-all ${currentPage === page ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 border border-zinc-800 rounded hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}