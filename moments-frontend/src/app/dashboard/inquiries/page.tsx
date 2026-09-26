'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Trash2, 
  Clock, 
  MessageCircle,
  CheckCircle2,
  Inbox,
  LayoutGrid,
  Table as TableIcon,
  PlusCircle,
  Loader2
} from 'lucide-react';

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    
    // Use getSession() instead of getUser() to prevent Web Lock collisions 
    // when the Dashboard Layout and Page mount simultaneously.
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) { router.push('/login'); return; }

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inquiries:", error);
    } else if (data) {
      setInquiries(data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('inquiries').update({ status: newStatus }).eq('id', id);

    if (!error) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (!error) {
      setInquiries(prev => prev.filter(inq => inq.id !== id));
    }
  };

  // ── Convert Lead to Active Event ──
  const handleConvertToEvent = async (inquiry: any) => {
    if (!confirm(`Convert ${inquiry.couple_name} into an active workspace event?`)) return;
    setUpdatingId(inquiry.id);

    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate a safe URL slug from the couple's name
    const baseSlug = inquiry.couple_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 1. Create the new Event record
    const { data: newEvent, error: eventError } = await supabase.from('events').insert([{
      owner_id: user?.id,
      title: inquiry.couple_name,
      event_date: inquiry.event_date,
      estimated_guests: inquiry.estimated_guests,
      contact_email: inquiry.email,
      contact_phone: inquiry.phone,
      status: 'active',
      slug: uniqueSlug,
      template_id: 'classic' // Default template, can be changed later
    }]).select().single();

    if (eventError || !newEvent) {
      alert("Error creating event: " + (eventError?.message || "Unknown error"));
      setUpdatingId(null);
      return;
    }

    // 2. Mark the inquiry as converted
    await supabase.from('inquiries').update({ status: 'converted' }).eq('id', inquiry.id);

    // 3. Route directly to the new Event Management page
    router.push(`/dashboard/events/${newEvent.id}`);
  };

  const formatPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ''); 
    if (cleaned.startsWith('0')) cleaned = '94' + cleaned.substring(1); 
    return cleaned;
  };

  const openWhatsApp = (inquiry: any) => {
    const message = `Hello ${inquiry.couple_name}, we received your inquiry for Moments by Studio Click.ed! We would love to help with your digital invitations for your upcoming celebration.`;
    window.open(`https://wa.me/${formatPhone(inquiry.phone)}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-md border bg-[#B8905B]/10 text-[#B8905B] border-[#B8905B]/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><Clock className="w-3 h-3" /> New Lead</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-md border bg-blue-900/20 text-blue-400 border-blue-900/50 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><MessageCircle className="w-3 h-3" /> Contacted</span>;
      case 'converted':
        return <span className="px-2.5 py-1 rounded-md border bg-green-900/20 text-green-400 border-green-900/50 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><CheckCircle2 className="w-3 h-3" /> Converted</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md border bg-zinc-900 text-zinc-400 border-zinc-700 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-zinc-300">
      
      {/* Professional Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Web Inquiries</h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">Manage incoming leads from the storefront</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <Inbox className="w-4 h-4 text-[#B8905B]" />
            <span className="text-xs font-bold text-white tracking-wider">{inquiries.filter(i => i.status === 'new').length} New Leads</span>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-inner">
            <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-[#B8905B] shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><TableIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#B8905B] rounded-full animate-spin mb-6"></div>
          <p className="text-[#B8905B] text-[10px] font-black tracking-[0.3em] uppercase">Loading CRM Data</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-32 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
          <p className="text-zinc-500 font-serif text-xl italic">No inquiries received yet.</p>
          <p className="text-xs text-zinc-600 uppercase tracking-widest mt-4">Leads from the website will appear here</p>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className={`bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl flex flex-col h-full shadow-lg transition-all hover:bg-zinc-900/80 ${inquiry.status === 'new' ? 'border-t-[#B8905B]' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl text-white mb-1 tracking-tight">{inquiry.couple_name}</h3>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Rec: {new Date(inquiry.created_at).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="font-mono text-zinc-400 text-xs">{inquiry.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="text-zinc-400 text-xs truncate">{inquiry.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="text-zinc-400 text-xs">{inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-[#B8905B]/70 shrink-0" />
                      <span className="text-[#B8905B] text-xs font-bold">{inquiry.estimated_guests} Guests</span>
                    </div>
                  </div>

                  {updatingId === inquiry.id ? (
                    <div className="py-2 flex justify-center"><Loader2 className="w-5 h-5 text-[#B8905B] animate-spin" /></div>
                  ) : (
                    <div className="space-y-3 pt-4 border-t border-zinc-800/60">
                      <select 
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2.5 outline-none cursor-pointer hover:border-zinc-600 hover:text-white transition-all appearance-none text-center"
                      >
                        <option value="new">Status: New</option>
                        <option value="contacted">Status: Contacted</option>
                        <option value="converted">Status: Converted</option>
                        <option value="archived">Status: Archive</option>
                      </select>

                      <div className="flex items-center justify-between gap-2">
                        <button onClick={() => openWhatsApp(inquiry)} className="flex-1 bg-green-900/20 border border-green-900/30 text-green-500 py-2.5 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center justify-center">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inquiry.id)} className="flex-1 bg-black border border-zinc-800 text-zinc-600 py-2.5 rounded-lg hover:text-red-500 hover:border-red-900/30 transition-all flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleConvertToEvent(inquiry)} className="flex-[2] bg-[#B8905B]/10 border border-[#B8905B]/30 text-[#B8905B] py-2.5 rounded-lg hover:bg-[#B8905B] hover:text-[#121110] transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                          <PlusCircle className="w-3.5 h-3.5" /> Event
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 text-zinc-500 border-b border-zinc-800 uppercase text-[9px] font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-5">Lead Details</th>
                    <th className="px-6 py-5">Contact Info</th>
                    <th className="px-6 py-5">Event Scope</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className={`transition-colors group ${inquiry.status === 'new' ? 'bg-[#B8905B]/5' : 'hover:bg-zinc-800/20'}`}>
                      
                      <td className="px-6 py-6 align-top">
                        <p className="font-serif text-xl text-white mb-2 tracking-tight">{inquiry.couple_name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                          Received: {new Date(inquiry.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-6 align-top">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Phone className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-xs font-mono text-zinc-300">{inquiry.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-xs text-zinc-400">{inquiry.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6 align-top">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-xs text-zinc-300">
                              {inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="w-3.5 h-3.5 text-[#B8905B]/70" />
                            <span className="text-xs text-[#B8905B] font-bold">{inquiry.estimated_guests} Guests</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6 align-top text-center">
                        {updatingId === inquiry.id ? (
                          <div className="flex justify-center"><Loader2 className="w-5 h-5 text-[#B8905B] animate-spin" /></div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            {getStatusBadge(inquiry.status)}
                            <select 
                              value={inquiry.status}
                              onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                              className="bg-black border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-widest rounded-md px-2 py-1 outline-none cursor-pointer hover:border-zinc-600 hover:text-white transition-all appearance-none text-center"
                            >
                              <option value="new">Mark New</option>
                              <option value="contacted">Mark Contacted</option>
                              <option value="converted">Mark Converted</option>
                              <option value="archived">Archive</option>
                            </select>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-6 align-top text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleConvertToEvent(inquiry)} 
                            className="px-3 py-2 rounded-lg border transition-all bg-[#B8905B]/10 text-[#B8905B] border-[#B8905B]/30 hover:bg-[#B8905B] hover:text-[#121110] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                            title="Convert to Active Event"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> Event
                          </button>
                          <button 
                            onClick={() => openWhatsApp(inquiry)} 
                            className="p-2.5 rounded-lg border transition-all bg-green-900/20 text-green-500 border-green-900/30 hover:bg-green-500 hover:text-white"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(inquiry.id)} 
                            className="p-2.5 bg-black border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900/30 rounded-lg transition-all"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}