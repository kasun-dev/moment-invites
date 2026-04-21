'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Zap, User, Users } from 'lucide-react';

export default function MetallicTemplate({ event, guest, subGuestsInitial }: any) {
  const [rsvpStatus, setRsvpStatus] = useState(guest.rsvp_status || 'pending');
  const [primaryAttending, setPrimaryAttending] = useState(guest.is_attending || false);
  const [subGuests, setSubGuests] = useState(subGuestsInitial || []);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(guest.rsvp_status !== 'pending');

  const submitRSVP = async () => {
    setSubmitting(true);
    try {
      await supabase.from('guests').update({ 
        rsvp_status: rsvpStatus, 
        is_attending: rsvpStatus === 'confirmed' ? primaryAttending : false 
      }).eq('id', guest.id);
      
      if (subGuests.length > 0) {
        const updates = subGuests.map((sg: any) => ({
          id: sg.id,
          parent_guest_id: guest.id,
          full_name: sg.full_name,
          is_attending: rsvpStatus === 'confirmed' ? sg.is_attending : false
        }));
        await supabase.from('sub_guests').upsert(updates);
      }
      setSubmitted(true);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans uppercase tracking-tighter">
      {/* Metallic Header */}
      <div className="border-b border-zinc-800 p-8 pt-20 bg-zinc-900/20 text-center">
        <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-6 h-6 text-zinc-500" />
        </div>
        <h1 className="text-6xl font-black mb-4 italic">{event.title}</h1>
        <p className="text-zinc-500 font-mono tracking-normal lowercase">{event.location} // {new Date(event.event_date).toLocaleDateString()}</p>
      </div>

      <div className="max-w-md mx-auto p-8 mt-10">
        <div className="border border-zinc-800 p-6 bg-zinc-900/10">
          <p className="text-xs text-zinc-600 mb-6 font-mono tracking-normal">Access Token Verified // Guest: {guest.first_name}</p>
          
          <div className="space-y-3 mb-8">
            <button onClick={() => {setRsvpStatus('confirmed'); setSubmitted(false);}} className={`w-full py-4 border italic font-bold ${rsvpStatus === 'confirmed' ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500'}`}>I'm In</button>
            <button onClick={() => {setRsvpStatus('declined'); setSubmitted(false);}} className={`w-full py-4 border italic font-bold ${rsvpStatus === 'declined' ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500'}`}>Can't Make It</button>
          </div>

          {rsvpStatus === 'confirmed' && (
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm font-bold flex items-center gap-2"><User className="w-4 h-4" /> {guest.first_name}</span>
                <input type="checkbox" checked={primaryAttending} onChange={() => setPrimaryAttending(!primaryAttending)} className="w-5 h-5 rounded-none border-zinc-700 bg-black text-white" />
              </label>
              {subGuests.map((sg:any) => (
                <label key={sg.id} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4" /> {sg.full_name}</span>
                  <input type="checkbox" checked={sg.is_attending} onChange={() => setSubGuests(subGuests.map((s:any) => s.id === sg.id ? {...s, is_attending: !s.is_attending} : s))} className="w-5 h-5 rounded-none border-zinc-700 bg-black text-white" />
                </label>
              ))}
            </div>
          )}

          {!submitted && rsvpStatus !== 'pending' && (
            <button onClick={submitRSVP} className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black italic">{submitting ? 'Uploading...' : 'Transmit RSVP'}</button>
          )}

          {submitted && <div className="mt-8 p-4 border border-green-900 bg-green-950/20 text-green-500 text-xs text-center font-mono tracking-normal">Status: RSVP Recorded Successfully</div>}
        </div>
      </div>
    </div>
  );
}