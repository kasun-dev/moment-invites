'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, MapPin, Link2, Plus, CheckCircle2, XCircle, Clock, Trash2, 
  Users, Check, UserPlus, LayoutGrid, Table as TableIcon, ChevronLeft, ChevronRight, 
  Loader2, Copy, MessageSquare, Send, X, CheckCheck 
} from 'lucide-react';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingGuests, setFetchingGuests] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Selection & Bulk State
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // UI View Toggle
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  // Form States
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [subGuestName, setSubGuestName] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error || !data) { router.push('/dashboard'); return; }
      setEvent(data);
    };
    fetchEvent();
  }, [eventId, router]);

  useEffect(() => {
    fetchPaginatedGuests();
  }, [eventId, currentPage, pageSize]);

  const fetchPaginatedGuests = async () => {
    setFetchingGuests(true);
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
    setFetchingGuests(false);
  };

  // --- LOGIC HELPERS ---
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
    const message = `Hello ${guest.first_name}! 👋\n\nWe are excited to invite you to *${event.title}*.\n\nPlease view your invitation and RSVP here:\n${baseUrl}/v/${event.slug}?guest=${guest.access_token}`;
    return `https://wa.me/${formatPhone(guest.phone)}?text=${encodeURIComponent(message)}`;
  };

  const handleManualCopy = (guest: any) => {
    const url = `${window.location.origin}/v/${event.slug}?guest=${guest.access_token}`;
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

  // --- DB ACTIONS ---
  const handleAddPrimaryGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingGuest(true);
    const { error } = await supabase.from('guests').insert([{
      event_id: eventId, first_name: newGuestName, phone: newGuestPhone, is_attending: false, invitation_sent: false
    }]);
    if (!error) { fetchPaginatedGuests(); setNewGuestName(''); setNewGuestPhone(''); }
    setAddingGuest(false);
  };

  const handleAddSubGuest = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!subGuestName.trim()) return;
    const { data } = await supabase.from('sub_guests').insert([{
      parent_guest_id: parentId, full_name: subGuestName, is_attending: false
    }]).select();
    if (data) {
      setGuests(guests.map(g => g.id === parentId ? { ...g, sub_guests: [...(g.sub_guests || []), data[0]] } : g));
      setSubGuestName(''); setActiveGuestId(null);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (confirm("Permanently delete guest?")) {
      await supabase.from('guests').delete().eq('id', guestId);
      fetchPaginatedGuests();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono tracking-widest uppercase">Initializing Workspace...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8 font-sans">
      
      {/* BULK MESSENGER MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-10 shadow-2xl relative">
            <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X /></button>
            <h3 className="text-xl font-bold text-white mb-2 italic tracking-tight">Batch Send</h3>
            <p className="text-xs text-zinc-500 mb-8 uppercase tracking-[0.3em]">Queue: {bulkIndex + 1} / {selectedGuestIds.length}</p>
            
            <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 mb-10 shadow-inner">
              <p className="text-[10px] text-zinc-600 uppercase font-black mb-3">Recipient</p>
              <p className="text-3xl font-bold text-white tracking-tighter">{guests.find(g => g.id === selectedGuestIds[bulkIndex])?.first_name}</p>
              <p className="text-sm text-zinc-500 font-mono mt-2 tracking-widest">{guests.find(g => g.id === selectedGuestIds[bulkIndex])?.phone}</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  const g = guests.find(g => g.id === selectedGuestIds[bulkIndex]);
                  triggerWhatsApp(g);
                  if (bulkIndex < selectedGuestIds.length - 1) setBulkIndex(bulkIndex + 1);
                  else { setIsBulkModalOpen(false); setSelectedGuestIds([]); }
                }}
                className="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 uppercase text-xs tracking-widest"
              >
                <Send className="w-4 h-4" /> Open WhatsApp & Next
              </button>
              <button onClick={() => bulkIndex < selectedGuestIds.length - 1 ? setBulkIndex(bulkIndex + 1) : setIsBulkModalOpen(false)} className="w-full py-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">Skip Guest</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-10 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <header className="mb-12 border-b border-zinc-800 pb-10">
          <h1 className="text-5xl font-black text-zinc-100 tracking-tighter italic mb-4 uppercase">{event?.title}</h1>
          <div className="flex items-center gap-8 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event?.event_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event?.location}</span>
          </div>
        </header>

        {/* QUICK ADD FORM */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl mb-12 shadow-2xl">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2"><UserPlus className="w-4 h-4"/> Register New Guest</h2>
          <form onSubmit={handleAddPrimaryGuest} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] text-zinc-600 mb-2 uppercase font-black tracking-widest">Full Name</label>
              <input type="text" required value={newGuestName} onChange={e => setNewGuestName(e.target.value)} className="w-full px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 outline-none focus:border-zinc-500 transition-all shadow-inner" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[10px] text-zinc-600 mb-2 uppercase font-black tracking-widest">WhatsApp Number</label>
              <input type="text" value={newGuestPhone} onChange={e => setNewGuestPhone(e.target.value)} placeholder="94..." className="w-full px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 outline-none focus:border-zinc-500 transition-all shadow-inner" />
            </div>
            <button type="submit" disabled={addingGuest} className="px-10 py-3 bg-zinc-100 text-zinc-950 font-black rounded-xl h-[52px] uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg">Add to List</button>
          </form>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black italic tracking-tighter">Guest List</h2>
            <div className="h-6 w-px bg-zinc-800" />
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Records: {totalCount}</span>
            {selectedGuestIds.length > 0 && (
              <button onClick={() => { setBulkIndex(0); setIsBulkModalOpen(true); }} className="bg-green-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-green-500 shadow-xl shadow-green-950/40 transition-all">
                <MessageSquare className="w-3.5 h-3.5" /> Batch Send {selectedGuestIds.length}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-inner">
              <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'card' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid className="w-4 h-4" /> Card</button>
              <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'table' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><TableIcon className="w-4 h-4" /> Table</button>
            </div>
            
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-2 rounded-xl outline-none focus:border-zinc-500 shadow-sm cursor-pointer">
              <option value={10}>10 Items</option>
              <option value={25}>25 Items</option>
              <option value={50}>50 Items</option>
            </select>
          </div>
        </div>

        {/* DATA RENDERING */}
        {viewMode === 'table' ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-zinc-600 border-b border-zinc-800 uppercase text-[10px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 w-10"><input type="checkbox" checked={selectedGuestIds.length === guests.length && guests.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-zinc-700 bg-black cursor-pointer" /></th>
                  <th className="px-4 py-5">Guest Info</th>
                  <th className="px-4 py-5">Sub-Guests</th>
                  <th className="px-4 py-5 text-center">Status</th>
                  <th className="px-4 py-5 text-center">Invited</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-sans">
                {guests.map((guest) => (
                  <tr key={guest.id} className={`transition-colors ${selectedGuestIds.includes(guest.id) ? 'bg-zinc-800/30' : 'hover:bg-zinc-800/10'}`}>
                    <td className="px-8 py-6 align-top"><input type="checkbox" checked={selectedGuestIds.includes(guest.id)} onChange={() => handleSelectGuest(guest.id)} className="w-4 h-4 rounded border-zinc-700 bg-black cursor-pointer" /></td>
                    <td className="px-4 py-6 align-top">
                      <div className="font-bold text-zinc-100 flex items-center gap-2 text-lg tracking-tight">
                        {guest.first_name} {guest.is_attending && <Check className="w-4 h-4 text-green-500 stroke-[4px]" />}
                      </div>
                      <div className="text-zinc-500 text-xs font-mono mt-1 tracking-wider">{guest.phone || '---'}</div>
                      <button onClick={() => handleManualCopy(guest)} className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border shadow-sm ${copiedId === guest.id ? 'bg-green-950/40 border-green-800 text-green-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300'}`}>
                        {copiedId === guest.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copiedId === guest.id ? 'Copied' : 'Magic Link'}
                      </button>
                    </td>
                    <td className="px-4 py-6 align-top">
                      <div className="space-y-2">
                        {guest.sub_guests?.map((sub: any) => (
                          <div key={sub.id} className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800/50 px-3 py-2 rounded-xl w-64 shadow-inner">
                            <Check className={`w-3.5 h-3.5 ${sub.is_attending ? 'text-green-500' : 'text-zinc-800'}`} /> 
                            <span className="text-xs font-bold text-zinc-400 truncate">{sub.full_name}</span>
                          </div>
                        ))}
                        {activeGuestId === guest.id ? (
                          <form onSubmit={(e) => handleAddSubGuest(e, guest.id)} className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-left-2">
                            <input type="text" autoFocus value={subGuestName} onChange={e => setSubGuestName(e.target.value)} className="bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-zinc-500 w-40" placeholder="Family Name..." />
                            <button type="submit" className="text-green-500 text-[10px] font-black uppercase">Add</button>
                            <button type="button" onClick={() => setActiveGuestId(null)} className="text-zinc-600 text-[10px] font-black uppercase">X</button>
                          </form>
                        ) : (
                          <button onClick={() => setActiveGuestId(guest.id)} className="text-[9px] font-black text-zinc-600 hover:text-zinc-300 mt-2 tracking-[0.2em] border border-dashed border-zinc-800 px-3 py-1.5 rounded-lg transition-all">+ REGISTER FAMILY</button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-6 align-top text-center">
                      <span className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${guest.rsvp_status === 'confirmed' ? 'bg-green-950/20 text-green-400 border-green-900/50' : guest.rsvp_status === 'declined' ? 'bg-red-950/20 text-red-400 border-red-900/50' : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'}`}>
                        {guest.rsvp_status}
                      </span>
                    </td>
                    <td className="px-4 py-6 align-top text-center">
                      {guest.invitation_sent ? <CheckCheck className="w-5 h-5 text-green-500/80 mx-auto" /> : <Clock className="w-5 h-5 text-zinc-800 mx-auto" />}
                    </td>
                    <td className="px-8 py-6 align-top text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => triggerWhatsApp(guest)} className={`p-3 rounded-xl border transition-all ${guest.invitation_sent ? 'bg-zinc-950 text-zinc-700 border-zinc-800' : 'bg-green-900/20 text-green-500 border-green-900/30 hover:bg-green-900/40 hover:scale-105'}`}><MessageSquare className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteGuest(guest.id)} className="p-3 text-zinc-800 hover:text-red-500 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/30"><Trash2 className="w-5 h-5" /></button>
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
              <div key={guest.id} className={`bg-zinc-900 border p-6 rounded-3xl transition-all relative group flex flex-col shadow-xl ${selectedGuestIds.includes(guest.id) ? 'border-zinc-400 ring-1 ring-zinc-400' : 'border-zinc-800 hover:border-zinc-700'}`}>
                <input type="checkbox" checked={selectedGuestIds.includes(guest.id)} onChange={() => handleSelectGuest(guest.id)} className="absolute top-6 right-6 w-4 h-4 rounded border-zinc-700 bg-black cursor-pointer z-10" />
                
                <div className="mb-6 pr-10 text-zinc-100">
                   <h3 className="text-xl font-bold italic tracking-tight flex items-center gap-2">
                     {guest.first_name} {guest.is_attending && <Check className="w-4 h-4 text-green-500 stroke-[3px]" />}
                   </h3>
                   <p className="text-zinc-500 text-xs font-mono tracking-widest mt-1">{guest.phone || '---'}</p>
                </div>

                <div className="flex-1 space-y-4 mb-6">
                   <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest ${guest.rsvp_status === 'confirmed' ? 'bg-green-950/20 text-green-400 border-green-900/50' : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'}`}>{guest.rsvp_status}</span>
                      {guest.invitation_sent && <span className="text-green-500 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"><CheckCheck className="w-3 h-3"/> Sent</span>}
                   </div>
                   
                   <div className="space-y-1.5">
                      {guest.sub_guests?.map((sub: any) => (
                         <div key={sub.id} className="text-[11px] text-zinc-400 flex items-center gap-2 bg-zinc-950/50 px-2 py-1 rounded-lg border border-zinc-800/50">
                            <Check className={`w-3 h-3 ${sub.is_attending ? 'text-green-500' : 'text-zinc-800'}`} /> {sub.full_name}
                         </div>
                      ))}
                      {activeGuestId === guest.id ? (
                        <form onSubmit={(e) => handleAddSubGuest(e, guest.id)} className="mt-2 flex gap-1">
                          <input type="text" autoFocus value={subGuestName} onChange={e => setSubGuestName(e.target.value)} className="bg-black border border-zinc-800 p-1 text-[10px] rounded-lg flex-1 outline-none" />
                          <button type="submit" className="text-green-500 text-[10px] font-black uppercase">Add</button>
                        </form>
                      ) : (
                        <button onClick={() => setActiveGuestId(guest.id)} className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-all font-black uppercase tracking-widest">+ Add Member</button>
                      )}
                   </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-3">
                   <button onClick={() => triggerWhatsApp(guest)} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 py-2.5 rounded-xl hover:text-green-500 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"><MessageSquare className="w-3.5 h-3.5" /> WA</button>
                   <button onClick={() => handleManualCopy(guest)} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 py-2.5 rounded-xl hover:text-zinc-100 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"><Copy className="w-3.5 h-3.5" /> Link</button>
                   <button onClick={() => handleDeleteGuest(guest.id)} className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 transition-all rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {copiedId === guest.id && <p className="absolute bottom-1 right-6 text-[8px] text-green-500 font-black italic">Copied!</p>}
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION NAVIGATION */}
        <div className="mt-12 flex justify-between items-center border-t border-zinc-900 pt-8 shadow-2xl">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Page {currentPage} / {totalPages || 1}</p>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 border border-zinc-800 rounded-xl disabled:opacity-5 transition-all hover:bg-zinc-900 shadow-lg"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 text-[10px] font-black rounded-xl border transition-all ${currentPage === page ? 'bg-zinc-100 text-zinc-950 border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'}`}>{page}</button>
                ))}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 border border-zinc-800 rounded-xl disabled:opacity-5 transition-all hover:bg-zinc-900 shadow-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}