'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, CheckCircle2, XCircle, Loader2, Check } from 'lucide-react';

export default function ClassicTemplate({ event, guest, subGuestsInitial }: any) {
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
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-20 px-6 font-serif">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="uppercase tracking-[0.4em] text-zinc-500 text-xs mb-8">Invitation</h2>
        <h1 className="text-5xl font-light text-zinc-100 mb-10 leading-tight">{event.title}</h1>
        
        <div className="flex flex-col gap-3 items-center text-zinc-400 mb-16 font-sans">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-10 rounded-2xl backdrop-blur-md font-sans">
          <h3 className="text-xl mb-8">Welcome, {guest.first_name}</h3>
          
          <div className="flex gap-4 mb-10">
            <button onClick={() => {setRsvpStatus('confirmed'); setSubmitted(false);}} className={`flex-1 p-4 rounded-xl border transition-all ${rsvpStatus === 'confirmed' ? 'bg-zinc-100 text-zinc-900 border-white' : 'border-zinc-800 text-zinc-500'}`}>Accept</button>
            <button onClick={() => {setRsvpStatus('declined'); setSubmitted(false);}} className={`flex-1 p-4 rounded-xl border transition-all ${rsvpStatus === 'declined' ? 'bg-zinc-100 text-zinc-900 border-white' : 'border-zinc-800 text-zinc-500'}`}>Decline</button>
          </div>

          {rsvpStatus === 'confirmed' && (
            <div className="space-y-4 mb-8 text-left">
              <label className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={primaryAttending} onChange={() => setPrimaryAttending(!primaryAttending)} className="w-5 h-5 rounded border-zinc-800 bg-zinc-900" />
                <span>I am attending</span>
              </label>
              {subGuests.map((sg: any) => (
                <label key={sg.id} className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={sg.is_attending} onChange={() => setSubGuests(subGuests.map((s:any) => s.id === sg.id ? {...s, is_attending: !s.is_attending} : s))} className="w-5 h-5 rounded border-zinc-800 bg-zinc-900" />
                  <span>{sg.full_name}</span>
                </label>
              ))}
            </div>
          )}

          {!submitted && rsvpStatus !== 'pending' && (
            <button onClick={submitRSVP} className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-xl font-bold uppercase tracking-widest">{submitting ? 'Sending...' : 'Confirm RSVP'}</button>
          )}

          {submitted && <p className="text-green-500 mt-4 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Response Saved</p>}
        </div>
      </div>
    </div>
  );
}