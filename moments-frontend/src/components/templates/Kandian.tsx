'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  CalendarPlus,
  ChevronDown,
  MapPin,
  Volume2,
  VolumeX,
  Heart,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface SubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  auspiciousTimeNote?: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  dressCode?: string;
}

export interface GuestData {
  id: string;
  fullName: string;
  allowedSubEventIds: string[];
  maxAllowedGuests: number;
  currentRsvp?: {
    attendingSubEvents: string[];
    attendingCount: number;
    dietaryPreference: string;
    wishingMessage?: string;
  };
}

export interface WeddingData {
  slug: string;
  brideName: string;
  groomName: string;
  monogramInitials: string;
  heroImageUrl: string;
  ambientAudioUrl?: string;
  subEvents: SubEvent[];
  dietaryOptions: string[];
  rsvpDeadline: string;
}

export interface InvitationTemplateProps {
  wedding: WeddingData;
  guest: GuestData;
  onSubmitRsvp: (rsvpData: {
    guestId: string;
    attendingSubEvents: string[];
    attendingCount: number;
    dietaryPreference: string;
    wishingMessage?: string;
  }) => Promise<{ success: boolean }>;
  isPastWedding?: boolean;
  originalEvent?: any;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. THE ADAPTER WRAPPER (Bridges Supabase Data to the Template)
// ────────────────────────────────────────────────────────────────────────────

export default function KandyanHeritageTemplate({ event, guest, subGuestsInitial }: any) {
  const [subGuests] = useState<any[]>(subGuestsInitial || []);

  // Safe fallback while loading
  if (!event || !guest) return null;

  const isPastWedding = new Date() > new Date(event.event_date);

  // Split "Kasun & Dewmi" into Groom and Bride names
  const parts = (event.title || 'Groom & Bride').split(/&|and/i).map((s: string) => s.trim());
  const groomName = parts[0] || 'Groom';
  const brideName = parts[1] || 'Bride';
  const monogramInitials = `${groomName.charAt(0)} & ${brideName.charAt(0)}`;
  
  // Map Supabase Event to Template WeddingData
  const mappedWedding: WeddingData = {
    slug: event.slug || 'wedding',
    brideName,
    groomName,
    monogramInitials,
    heroImageUrl: 'https://images.unsplash.com/photo-1583939006992-1981ed488ea9?q=80&w=2070', // Luxury editorial default image
    ambientAudioUrl: undefined,
    subEvents: (event.itinerary || []).map((ev: any) => ({
      id: ev.id,
      title: ev.name,
      date: new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: ev.time || '09:00 AM',
      auspiciousTimeNote: ev.time, // Map time to auspicious note for Kandyan theme
      venueName: ev.location.split(',')[0] || ev.location,
      venueAddress: ev.location,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`,
    })),
    dietaryOptions: event.ask_dietary ? ['Standard Menu', 'Vegetarian (නිර්මාංශ)', 'Vegan', 'Halal (හලාල්)', 'Specific Allergies'] : ['Standard Menu'],
    rsvpDeadline: new Date(new Date(event.event_date).getTime() - 14 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };

  // Map Supabase Guest to Template GuestData
  const totalAllowed = 1 + (subGuests?.length || 0);
  let mappedRsvp: GuestData['currentRsvp'] = undefined;
  
  if (guest.rsvp_status !== 'pending') {
     mappedRsvp = {
        attendingSubEvents: guest.attending_events || [],
        attendingCount: (guest.is_attending ? 1 : 0) + (subGuests?.filter((sg: any) => sg.is_attending).length || 0),
        dietaryPreference: guest.dietary_preference || 'Standard Menu',
        wishingMessage: guest.guestbook_message || ''
     };
  }

  const mappedGuest: GuestData = {
    id: guest.id || 'preview',
    fullName: guest.first_name || 'Honored Guest',
    allowedSubEventIds: guest.invited_events?.length ? guest.invited_events : (event.itinerary || []).map((e: any) => e.id),
    maxAllowedGuests: totalAllowed,
    currentRsvp: mappedRsvp
  };

  // Handle saving the RSVP back to Supabase
  const handleSubmitRsvp = async (rsvpData: any) => {
    if (guest.id === 'mock-guest-1' || !guest.id) {
       // Preview mode bypass
       return new Promise<{success: boolean}>(res => setTimeout(() => res({success: true}), 1000));
    }

    try {
      const isAttending = rsvpData.attendingCount > 0;
      
      await supabase.from('guests').update({
        rsvp_status: isAttending ? 'confirmed' : 'declined',
        is_attending: isAttending,
        dietary_preference: rsvpData.dietaryPreference,
        attending_events: isAttending ? rsvpData.attendingSubEvents : [],
        guestbook_message: rsvpData.wishingMessage
      }).eq('id', guest.id);

      if (subGuests && subGuests.length > 0) {
        const updates = subGuests.map((sg: any, index: number) => {
           // Primary guest is count 1, sub-guests are 2, 3, etc.
           const sgAttending = isAttending && (index + 1 < rsvpData.attendingCount);
           return {
              id: sg.id,
              parent_guest_id: guest.id,
              full_name: sg.full_name,
              is_attending: sgAttending,
              dietary_preference: rsvpData.dietaryPreference,
              attending_events: sgAttending ? rsvpData.attendingSubEvents : []
           };
        });
        await supabase.from('sub_guests').upsert(updates);
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  return (
    <KandyanTemplateUI 
       wedding={mappedWedding} 
       guest={mappedGuest} 
       onSubmitRsvp={handleSubmitRsvp} 
       isPastWedding={isPastWedding}
       originalEvent={event}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Small date/calendar helpers
// ────────────────────────────────────────────────────────────────────────────

function parseEventDateTime(ev: SubEvent): Date | null {
  const cleanedTime = ev.time.replace(/onwards|from|starting at/gi, '').trim();
  const attempt = new Date(`${ev.date} ${cleanedTime}`);
  if (!Number.isNaN(attempt.getTime())) return attempt;
  const dateOnly = new Date(ev.date);
  return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
}

function toICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildGoogleCalendarUrl(ev: SubEvent, weddingTitle: string): string | null {
  const start = parseEventDateTime(ev);
  if (!start) return null;
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${weddingTitle} — ${ev.title}`,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    location: `${ev.venueName}, ${ev.venueAddress}`,
    details: ev.auspiciousTimeNote ?? 'We look forward to celebrating with you.',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadICS(ev: SubEvent, weddingTitle: string) {
  const start = parseEventDateTime(ev);
  if (!start) return;
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${weddingTitle} — ${ev.title}`,
    `LOCATION:${ev.venueName}, ${ev.venueAddress}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${ev.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function useCountdown(target: Date | null) {
  const [remaining, setRemaining] = useState<number>(() =>
    target ? target.getTime() - Date.now() : -1
  );
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target || remaining <= 0) return null;
  const s = Math.floor(remaining / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Royal Kandyan Specific SVGs
// ────────────────────────────────────────────────────────────────────────────

function TraditionalGaja({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" aria-hidden="true">
      <g stroke="#D4AF37" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20,100 C30,80 50,75 70,75 C95,75 120,65 140,80 C155,90 165,110 170,125 C172,130 178,125 180,110 C182,90 175,60 150,50 C125,40 100,45 80,45 C50,45 30,55 20,70 Z" />
        <path d="M70,75 Q95,100 120,75 M80,85 Q95,105 110,85 M75,55 Q95,65 115,55" strokeWidth="0.8" />
        <path d="M20,100 Q10,105 5,120 Q0,135 10,140 Q20,145 15,130 Q10,115 25,110" strokeWidth="1.5" />
        <path d="M22,112 Q35,115 45,108" strokeWidth="2" stroke="rgba(245,230,196,0.8)" />
        <path d="M30,70 Q40,60 45,75 M35,65 Q42,58 48,68" />
        <circle cx="38" cy="68" r="1.5" fill="#D4AF37" />
        <path d="M45,120 L40,150 L55,150 L55,122 M135,120 L135,150 L150,150 L145,120" strokeWidth="1.5" />
        <path d="M170,115 Q175,125 172,145" />
      </g>
    </svg>
  );
}

function PoruwaSunMandala({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <g transform="translate(200,200)" fill="none" stroke="#D4AF37" strokeWidth="0.8">
        <circle r="185" strokeWidth="1.5" /><circle r="175" strokeDasharray="4,4" /><circle r="150" /><circle r="120" /><circle r="85" /><circle r="50" /><circle r="20" />
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-20" x2="0" y2="-175" />
            <path d="M0,-120 Q8,-140 0,-150 Q-8,-140 0,-120Z" fill="rgba(212,175,55,0.08)" />
            <path d="M0,-85 Q12,-100 0,-120 Q-12,-100 0,-85Z" />
            <circle cx="0" cy="-165" r="3" fill="#D4AF37" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function PunkalasaDivider() {
  return (
    <div className="kh-divider" aria-hidden="true">
      <span />
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <g transform="translate(16,16)" stroke="#D4AF37" strokeWidth="1" fill="none">
          <path d="M-8,6 C-10,0 -8,-6 0,-8 C8,-6 10,0 8,6 C6,10 4,11 0,11 C-4,11 -6,10 -8,6 Z" fill="rgba(212,175,55,0.08)" />
          <path d="M-4,-8 C-6,-12 0,-14 0,-14 C0,-14 6,-12 4,-8 Z" />
          <path d="M-6,11 L6,11 M-5,13 L5,13" strokeWidth="1.5" />
          <circle cx="0" cy="-1" r="2.5" />
        </g>
      </svg>
      <span />
    </div>
  );
}

function KandyanKshanaSuccess() {
  return (
    <svg width="80" height="80" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g transform="translate(32,32)" stroke="#D4AF37" strokeWidth="1" fill="none">
        <circle r="30" strokeWidth="1.5" /><circle r="22" /><circle r="14" /><circle r="6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-6" x2="0" y2="-30" />
            <path d="M0,-14 Q5,-22 0,-26 Q-5,-22 0,-14Z" fill="#D4AF37" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function HeritageKandyanCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <div onClick={onChange} className="kh-checkbox-row select-none" style={{ background: checked ? 'rgba(212,175,55,0.1)' : 'rgba(0,0,0,0.2)' }}>
      <div className={`kh-check ${checked ? 'on' : ''}`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#800000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="kh-eyebrow">{children}</p>;
}

function WaxSeal({ initials, onTap }: { initials: string; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} className="kh-seal group" aria-label="Open invitation">
      <svg viewBox="0 0 120 120" className="kh-seal-ring" aria-hidden="true">
        <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="0.75" />
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          return (
            <line key={i} x1={60 + Math.cos(angle) * 50} y1={60 + Math.sin(angle) * 50} x2={60 + Math.cos(angle) * 55} y2={60 + Math.sin(angle) * 55} stroke="rgba(212,175,55,0.4)" strokeWidth="0.6" />
          );
        })}
      </svg>
      <span className="kh-seal-face">{initials}</span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. The Original UI Template
// ────────────────────────────────────────────────────────────────────────────

function KandyanTemplateUI({
  wedding,
  guest,
  onSubmitRsvp,
  isPastWedding,
  originalEvent
}: InvitationTemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [stage, setStage] = useState<Stage>('sealed');
  const [muted, setMuted] = useState(false);

  const allowedEvents = useMemo(
    () => wedding.subEvents.filter((e) => guest.allowedSubEventIds.includes(e.id)),
    [wedding.subEvents, guest.allowedSubEventIds]
  );

  const earliestDate = useMemo(() => {
    const dates = allowedEvents
      .map(parseEventDateTime)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());
    return dates[0] ?? null;
  }, [allowedEvents]);

  const countdown = useCountdown(earliestDate);

  // ── RSVP state ──
  const hasExistingRsvp = Boolean(guest.currentRsvp);
  const [editing, setEditing] = useState(!hasExistingRsvp);
  const [choice, setChoice] = useState<RsvpChoice>(
    hasExistingRsvp
      ? guest.currentRsvp!.attendingSubEvents.length > 0
        ? 'attending'
        : 'declining'
      : 'undecided'
  );
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    guest.currentRsvp?.attendingSubEvents ?? allowedEvents.map((e) => e.id)
  );
  const [guestCount, setGuestCount] = useState(
    guest.currentRsvp?.attendingCount ?? 1
  );
  const [dietary, setDietary] = useState(
    guest.currentRsvp?.dietaryPreference ?? wedding.dietaryOptions[0] ?? 'Standard'
  );
  const [wish, setWish] = useState(guest.currentRsvp?.wishingMessage ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.body.style.overflow = stage === 'open' ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [stage]);

  const openInvitation = () => {
    setStage('opening');
    if (wedding.ambientAudioUrl && audioRef.current) {
      audioRef.current.volume = 0.55;
      audioRef.current.play().catch(() => {});
    }
    window.setTimeout(() => setStage('open'), prefersReducedMotion ? 50 : 1350);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  };

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const result = await onSubmitRsvp({
        guestId: guest.id,
        attendingSubEvents: choice === 'attending' ? selectedEvents : [],
        attendingCount: choice === 'attending' ? guestCount : 0,
        dietaryPreference: choice === 'attending' ? dietary : wedding.dietaryOptions[0] ?? 'Standard',
        wishingMessage: wish.trim() || undefined,
      });
      if (result.success) {
        setSubmitStatus('success');
        setEditing(false);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmedEventsForCalendar = choice === 'attending' ? allowedEvents.filter((e) => selectedEvents.includes(e.id)) : [];
  const weddingTitle = `${wedding.groomName} & ${wedding.brideName}`;

  // ── Post-Wedding Transformation UI ──
  if (isPastWedding) {
    return (
      <div className="kh-root flex flex-col items-center justify-center text-center p-8 min-h-[100svh] relative">
        <FontLoader />
        <GlobalStyles />
        <PoruwaSunMandala className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 animate-[spin_180s_linear_infinite] pointer-events-none" />
        <div className="relative z-10 max-w-lg bg-[#2A0005]/80 backdrop-blur-md border border-[#D4AF37]/30 p-10 rounded-lg shadow-2xl">
          <Heart className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h1 className="font-['Cinzel'] text-4xl text-white mb-4">Thank You</h1>
          <p className="text-lg text-[#F5E6C4]/80 mb-8 leading-relaxed">
            Our wedding day was made truly magical by the presence of our beloved friends and family. Thank you for celebrating {originalEvent?.title || weddingTitle} with us.
          </p>
          <button 
            onClick={() => window.open('https://studioclicked.lk', '_blank')}
            className="bg-[#D4AF37] text-[#3A0007] px-8 py-3 rounded text-sm font-['Cinzel'] font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 mx-auto"
          >
            <ExternalLink className="w-4 h-4"/> View Photography Gallery
          </button>
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]/50 mt-8 font-bold">Moments by Studio Click.ed</p>
        </div>
      </div>
    );
  }

  // ── Standard Invitation UI ──
  return (
    <div className="kh-root">
      <FontLoader />
      <GlobalStyles />

      {wedding.ambientAudioUrl && <audio ref={audioRef} src={wedding.ambientAudioUrl} loop preload="none" />}

      {stage === 'open' && wedding.ambientAudioUrl && (
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'} className="kh-mute-toggle">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* ── Stage 1 & 2 — Envelope + Wax Seal ── */}
      <AnimatePresence>
        {stage !== 'open' && (
          <motion.div
            className="kh-envelope-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.6, delay: 0.7 }}
          >
            <PoruwaSunMandala className="kh-mandala-bg" />
            <motion.div
              className="kh-envelope-flap"
              animate={stage === 'opening' && !prefersReducedMotion ? { rotateX: -165 } : { rotateX: 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.div
              className="kh-envelope-card"
              animate={stage === 'opening' ? { y: prefersReducedMotion ? -8 : -180, opacity: prefersReducedMotion ? 0 : 1 } : { y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="kh-envelope-kicker">ආයුබෝවන්</p>
              <p className="kh-envelope-guest">{guest.fullName}</p>
            </motion.div>
            <div className="kh-envelope-seal-wrap">
              <WaxSeal initials={wedding.monogramInitials} onTap={openInvitation} />
              {stage === 'sealed' && <p className="kh-tap-hint">Tap the seal to open</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage 3 — The Stationery Suite ── */}
      {stage === 'open' && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          
          {/* Hero */}
          <section className="kh-hero">
            <PoruwaSunMandala className="kh-sun-mandala" />
            <TraditionalGaja className="kh-gaja-left" />
            <TraditionalGaja className="kh-gaja-right" />
            
            <div className="kh-ayubowan-badge">ආයුබෝවන්</div>
            <SectionLabel>We invite you to celebrate with us</SectionLabel>
            <h1 className="kh-hero-names">
              {wedding.groomName}
              <span className="kh-hero-amp">&amp;</span>
              {wedding.brideName}
            </h1>
            
            <div className="kh-hero-portrait">
              <img src={wedding.heroImageUrl} alt={`${weddingTitle} portrait`} />
            </div>

            {countdown && (
              <div className="kh-countdown">
                {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                  <div key={unit} className="kh-countdown-cell">
                    <span className="kh-countdown-num">{String(countdown[unit]).padStart(2, '0')}</span>
                    <span className="kh-countdown-label">{unit}</span>
                  </div>
                ))}
              </div>
            )}
            <ChevronDown className="kh-scroll-cue" size={18} strokeWidth={1.25} />
          </section>

          {/* Invitation Details */}
          <section className="kh-section">
            <SectionLabel>Wedding Invitation</SectionLabel>
            <div className="kh-poruwa-card">
              <h3 className="kh-sinhala-greeting">දේව ආශිර්වාදය මැද</h3>
              <p className="kh-formal-body">
                Together with our families, we honorably solicit the pleasure of your presence to grace our auspicious marital union and bless the commencement of our shared life journey.
              </p>
              <div className="kh-guest-highlight">Dear {guest.fullName.split(' ')[0]},</div>
              <p className="kh-formal-body" style={{ color: 'var(--kh-gold)', fontStyle: 'italic' }}>
                ඔබගේ පැමිණීම අපගේ සතුටයි.<br />
                Your presence on our special day remains our highest honor.
              </p>
            </div>
          </section>

          <PunkalasaDivider />

          {/* Sub-events / Itinerary */}
          <section className="kh-section">
            <SectionLabel>Auspicious Times</SectionLabel>
            <h2 className="kh-section-title">නැකත් සහ විස්තර</h2>
            <div className="kh-events-stack">
              {allowedEvents.map((ev) => (
                <article key={ev.id} className="kh-event-card">
                  <h3 className="kh-event-title">{ev.title}</h3>
                  <p className="kh-event-date">{ev.date}</p>
                  
                  {ev.auspiciousTimeNote ? (
                    <div className="kh-nakath-box">
                      <p className="kh-nakath-label">Auspicious Time (නැකත)</p>
                      <p className="kh-nakath-time">{ev.auspiciousTimeNote}</p>
                    </div>
                  ) : (
                    <p className="kh-event-time">{ev.time}</p>
                  )}

                  <div style={{ width: '40px', height: '1px', background: 'var(--kh-gold)', margin: '16px auto', opacity: 0.4 }} />

                  <div className="kh-event-venue">
                    <p className="kh-event-venue-name">{ev.venueName}</p>
                    <p className="kh-event-venue-address">{ev.venueAddress}</p>
                  </div>
                  {ev.dressCode && <p className="kh-event-dresscode">Dress code · {ev.dressCode}</p>}
                  
                  <button type="button" className="kh-outline-btn" onClick={() => window.open(ev.mapUrl, '_blank', 'noopener,noreferrer')}>
                    <MapPin size={14} /> Location Map
                  </button>
                </article>
              ))}
            </div>
          </section>

          <PunkalasaDivider />

          {/* RSVP */}
          <section className="kh-section kh-rsvp-section">
            <SectionLabel>Kindly respond by {wedding.rsvpDeadline}</SectionLabel>
            <h2 className="kh-section-title">ඔබගේ පැමිණීම</h2>
            
            <div className="kh-rsvp-container">
              {!editing && hasExistingRsvp ? (
                <RsvpSummary choice={choice} guestCount={guestCount} dietary={dietary} events={allowedEvents.filter((e) => (guest.currentRsvp?.attendingSubEvents ?? []).includes(e.id))} onEdit={() => { setEditing(true); setSubmitStatus('idle'); }} />
              ) : (
                <>
                  <p className="kh-rsvp-greeting">Welcome, {guest.fullName.split(' ')[0]}</p>
                  <p className="kh-rsvp-subline">Kindly verify your reservation choices below</p>

                  <div className="kh-choice-row">
                    <button type="button" className={`kh-choice-btn ${choice === 'attending' ? 'is-selected-yes' : ''}`} onClick={() => setChoice('attending')}>
                      Joyfully Accept
                    </button>
                    <button type="button" className={`kh-choice-btn ${choice === 'declining' ? 'is-selected-no' : ''}`} onClick={() => setChoice('declining')}>
                      Regretfully Decline
                    </button>
                  </div>

                  {choice === 'attending' && (
                    <div className="kh-rsvp-fields">
                      <div className="kh-field-group">
                        <span className="kh-field-label">Which celebrations will you attend?</span>
                        {allowedEvents.map((ev) => (
                          <label key={ev.id} className="kh-checkbox-row">
                            <input type="checkbox" checked={selectedEvents.includes(ev.id)} onChange={() => toggleEvent(ev.id)} />
                            {ev.title}
                          </label>
                        ))}
                      </div>

                      <div className="kh-field-group">
                        <span className="kh-field-label">Number attending (up to {guest.maxAllowedGuests})</span>
                        <div className="kh-stepper">
                          <button type="button" onClick={() => setGuestCount((n) => Math.max(1, n - 1))} aria-label="Decrease guest count">−</button>
                          <span>{guestCount}</span>
                          <button type="button" onClick={() => setGuestCount((n) => Math.min(guest.maxAllowedGuests, n + 1))} aria-label="Increase guest count">+</button>
                        </div>
                      </div>

                      <div className="kh-field-group">
                        <label className="kh-field-label" htmlFor="kh-dietary">Dietary preference</label>
                        <select id="kh-dietary" className="kh-select" value={dietary} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDietary(e.target.value)}>
                          {wedding.dietaryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="kh-field-group">
                        <label className="kh-field-label" htmlFor="kh-wish">Leave a Blessing for the Couple (Optional)</label>
                        <textarea id="kh-wish" className="kh-textarea" value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Wishing you a lifetime of happiness..." rows={3} />
                      </div>
                    </div>
                  )}

                  {choice !== 'undecided' && (
                    <button type="button" className="kh-submit-btn" onClick={submit} disabled={submitting}>
                      {submitting ? 'Updating System...' : 'Submit Response'}
                    </button>
                  )}

                  {submitStatus === 'error' && <p className="kh-submit-error">Something went wrong. Please try again.</p>}
                </>
              )}

              {submitStatus === 'success' && confirmedEventsForCalendar.length > 0 && (
                <div className="kh-calendar-block">
                  <p className="kh-field-label">Save the date</p>
                  {confirmedEventsForCalendar.map((ev) => {
                    const gcalUrl = buildGoogleCalendarUrl(ev, weddingTitle);
                    return (
                      <div key={ev.id} className="kh-calendar-row">
                        <span className="kh-calendar-row-label">{ev.title}</span>
                        <div className="kh-calendar-row-actions">
                          {gcalUrl && (
                            <button type="button" className="kh-outline-btn" onClick={() => window.open(gcalUrl, '_blank', 'noopener,noreferrer')}>
                              <CalendarPlus size={14} /> Google
                            </button>
                          )}
                          <button type="button" className="kh-outline-btn" onClick={() => downloadICS(ev, weddingTitle)}>
                            <CalendarPlus size={14} /> Apple / Outlook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <footer className="kh-footer">
            <p className="kh-footer-monogram">{wedding.monogramInitials}</p>
            <p className="kh-footer-line">With love and gratitude for your presence.</p>
          </footer>
        </motion.main>
      )}
    </div>
  );
}

function RsvpSummary({
  choice,
  guestCount,
  dietary,
  events,
  onEdit,
}: {
  choice: RsvpChoice;
  guestCount: number;
  dietary: string;
  events: SubEvent[];
  onEdit: () => void;
}) {
  return (
    <div className="kh-rsvp-summary">
      <p className="kh-rsvp-summary-heading">
        {choice === 'attending' ? 'ස්තූතියි - Response Recorded' : 'Response recorded'}
      </p>
      {choice === 'attending' && (
        <>
          <p className="kh-rsvp-summary-line">
            {guestCount} guest{guestCount > 1 ? 's' : ''} · {dietary}
          </p>
          <p className="kh-rsvp-summary-line" style={{ color: 'var(--kh-gold)', marginTop: '8px' }}>
            {events.map((e) => e.title).join(', ') || 'No celebrations selected'}
          </p>
        </>
      )}
      <button type="button" className="kh-outline-btn" style={{ marginTop: '24px' }} onClick={onEdit}>
        Update response
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Fonts + Global Styles
// ────────────────────────────────────────────────────────────────────────────

function FontLoader() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
    />
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .kh-root {
        --kh-bg: #2A0005;
        --kh-bg-gradient: radial-gradient(circle at center, #52000B 0%, #1F0003 100%);
        --kh-gold: #D4AF37;
        --kh-gold-light: #F5E6C4;
        --kh-dark: #120002;
        --kh-border: rgba(212,175,55,0.3);
        
        box-sizing: border-box;
        background: var(--kh-bg);
        background-image: var(--kh-bg-gradient);
        font-family: 'Abhaya Libre', serif;
        color: var(--kh-gold-light);
        min-height: 100dvh;
        overflow-x: hidden;
        -webkit-tap-highlight-color: transparent;
      }

      /* Envelope Screen */
      .kh-envelope-screen {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--kh-bg-gradient);
        padding: env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px);
        perspective: 1400px;
        overflow: hidden;
      }
      .kh-mandala-bg {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 800px; height: 800px; opacity: 0.1; animation: kh-spin 160s linear infinite; pointer-events: none;
      }
      @keyframes kh-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

      .kh-envelope-flap {
        position: absolute;
        top: calc(50% - 118px);
        width: 240px;
        height: 130px;
        background: linear-gradient(160deg, #4A0009, var(--kh-bg));
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        transform-origin: top center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .kh-envelope-card {
        position: relative;
        width: 260px;
        min-height: 150px;
        background: var(--kh-bg);
        border: 2px solid var(--kh-gold);
        box-shadow: 0 18px 40px rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 28px 20px;
        margin-top: 6px;
      }
      .kh-envelope-kicker {
        font-family: 'Abhaya Libre', serif;
        font-size: 14px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--kh-gold);
        margin-bottom: 10px;
        font-weight: 700;
      }
      .kh-envelope-guest {
        font-family: 'Cinzel', serif;
        font-size: 22px;
        font-weight: 600;
        color: #FFF;
      }
      .kh-envelope-seal-wrap {
        position: absolute;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 64px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }
      .kh-seal {
        position: relative; width: 84px; height: 84px; border-radius: 50%; border: none; cursor: pointer;
        background: radial-gradient(circle at 35% 30%, #800000 0%, #3A0007 75%);
        box-shadow: 0 10px 22px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.15);
        display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;
      }
      .kh-seal:active { transform: scale(0.92); }
      .kh-seal-ring { position: absolute; inset: 0; width: 100%; height: 100%; }
      .kh-seal-face { position: relative; font-family: 'Cinzel', serif; font-size: 20px; font-weight: 600; color: var(--kh-gold); letter-spacing: 0.05em; }
      .kh-tap-hint { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(245,230,196,0.5); font-family: 'Inter', sans-serif; }

      .kh-mute-toggle {
        position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: max(16px, env(safe-area-inset-bottom, 0px)); z-index: 40;
        width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--kh-border); background: rgba(42,0,5,0.8); backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center; color: var(--kh-gold);
      }

      /* Hero */
      .kh-hero { position: relative; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; }
      .kh-sun-mandala { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; opacity: 0.08; animation: kh-spin 140s linear infinite; pointer-events: none; }
      .kh-gaja-left { position: absolute; left: -30px; bottom: 40px; width: 220px; opacity: 0.15; pointer-events: none; transform: scaleX(1); }
      .kh-gaja-right { position: absolute; right: -30px; bottom: 40px; width: 220px; opacity: 0.15; pointer-events: none; transform: scaleX(-1); }

      .kh-ayubowan-badge { font-weight: 700; font-size: 20px; letter-spacing: 0.15em; color: var(--kh-gold); margin-bottom: 20px; border: 1px solid var(--kh-border); padding: 6px 24px; background: rgba(31,0,3,0.4); border-radius: 4px; }
      .kh-hero-names { font-family: 'Cinzel', serif; font-size: clamp(34px, 7vw, 56px); font-weight: 600; color: #FFF; text-shadow: 0 4px 12px rgba(0,0,0,0.6); line-height: 1.2; margin-bottom: 24px; letter-spacing: 0.05em; }
      .kh-hero-amp { display: block; font-style: italic; font-size: 0.55em; color: var(--kh-gold); margin: 8px 0; opacity: 0.8; }
      
      .kh-hero-portrait { width: min(280px, 72vw); aspect-ratio: 4 / 5; border: 2px solid var(--kh-border); padding: 6px; margin-bottom: 32px; background: var(--kh-bg); }
      .kh-hero-portrait img { width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.9) contrast(1.1); }

      .kh-countdown { display: flex; gap: 20px; font-family: 'Cinzel', serif; }
      .kh-countdown-cell { display: flex; flex-direction: column; align-items: center; }
      .kh-countdown-num { font-size: 28px; color: var(--kh-gold); font-weight: 600; }
      .kh-countdown-label { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,230,196,0.5); margin-top: 2px; }
      .kh-scroll-cue { margin-top: 40px; color: var(--kh-gold); opacity: 0.7; }

      /* Sections */
      .kh-section { max-width: 680px; margin: 0 auto; padding: 80px 24px; text-align: center; }
      .kh-eyebrow { display: block; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--kh-gold); margin-bottom: 16px; font-weight: 700; font-family: 'Inter', sans-serif; }
      .kh-section-title { font-family: 'Cinzel', serif; font-size: 32px; font-weight: 500; color: #FFF; margin-bottom: 24px; }
      
      .kh-divider { display: flex; align-items: center; justify-content: center; gap: 16px; max-width: 360px; margin: 0 auto 40px; }
      .kh-divider span { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--kh-gold)); }
      .kh-divider span:last-child { background: linear-gradient(to left, transparent, var(--kh-gold)); }

      /* Formal Card */
      .kh-poruwa-card { border: 2px solid var(--kh-gold); background: var(--kh-bg); box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-radius: 4px; padding: 60px 40px; position: relative; overflow: hidden; }
      .kh-poruwa-card::before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; border: 1px solid var(--kh-border); pointer-events: none; }
      .kh-sinhala-greeting { font-size: 24px; font-weight: 700; color: var(--kh-gold); margin-bottom: 24px; }
      .kh-formal-body { font-size: 18px; line-height: 1.8; color: var(--kh-gold-light); font-weight: 400; }
      .kh-guest-highlight { font-family: 'Cinzel', serif; font-size: 26px; color: #FFF; margin: 28px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }

      /* Events */
      .kh-events-stack { display: flex; flex-direction: column; gap: 24px; }
      .kh-event-card { background: var(--kh-bg); border: 1px solid var(--kh-border); padding: 40px 32px; max-width: 500px; margin: 0 auto; border-radius: 4px; }
      .kh-event-title { font-family: 'Cinzel', serif; font-size: 22px; color: var(--kh-gold); margin-bottom: 8px; font-weight: 600; }
      .kh-event-date { font-size: 16px; color: #FFF; font-family: 'Inter', sans-serif; font-weight: 500; margin-bottom: 4px; }
      .kh-event-time { font-family: 'Cinzel', serif; font-size: 20px; color: var(--kh-gold-light); margin-bottom: 14px; }
      
      .kh-nakath-box { border: 1px dashed var(--kh-border); padding: 16px; margin: 24px auto; max-width: 300px; background: rgba(212,175,55,0.05); }
      .kh-nakath-label { font-size: 14px; color: var(--kh-gold); margin-bottom: 4px; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
      .kh-nakath-time { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; color: #FFF; }

      .kh-event-venue-name { font-size: 18px; font-weight: 700; color: #FFF; }
      .kh-event-venue-address { font-size: 14px; color: rgba(245,230,196,0.6); margin-bottom: 16px; font-family: 'Inter', sans-serif; }
      .kh-event-dresscode { font-size: 13px; color: var(--kh-gold); margin-bottom: 18px; font-family: 'Inter', sans-serif; font-style: italic; }
      
      .kh-outline-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; border: 1px solid var(--kh-gold); color: var(--kh-gold); background: transparent; padding: 10px 28px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; font-weight: 700; border-radius: 2px; }
      .kh-outline-btn:hover { background: var(--kh-gold); color: var(--kh-dark); }

      /* RSVP */
      .kh-rsvp-container { background: var(--kh-bg); border: 2px solid var(--kh-gold); max-width: 540px; margin: 0 auto; padding: 48px 36px; border-radius: 4px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); text-align: left; }
      .kh-rsvp-greeting { font-family: 'Cinzel', serif; font-size: 24px; color: #FFF; margin-bottom: 6px; text-align: center; }
      .kh-rsvp-subline { font-size: 14px; color: rgba(245,230,196,0.6); margin-bottom: 32px; text-align: center; font-family: 'Inter', sans-serif; }

      .kh-choice-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
      .kh-choice-btn { padding: 14px; border: 1px solid var(--kh-border); background: transparent; color: var(--kh-gold); font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; border-radius: 2px; text-transform: uppercase; }
      .kh-choice-btn:hover { background: rgba(212,175,55,0.1); }
      .is-selected-yes { background: var(--kh-gold) !important; color: var(--kh-dark) !important; border-color: var(--kh-gold) !important; }
      .is-selected-no { background: var(--kh-dark) !important; color: var(--kh-gold-light) !important; border-color: var(--kh-dark) !important; }

      .kh-rsvp-fields { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
      .kh-field-group { display: flex; flex-direction: column; gap: 12px; }
      .kh-field-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--kh-gold); font-weight: 700; font-family: 'Inter', sans-serif; }
      
      .kh-checkbox-row { display: flex; align-items: center; gap: 12px; font-size: 16px; color: var(--kh-gold-light); cursor: pointer; padding: 12px 16px; border: 1px solid var(--kh-border); border-radius: 4px; background: rgba(0,0,0,0.2); }
      .kh-checkbox-row input { accent-color: var(--kh-gold); width: 18px; height: 18px; }
      
      .kh-stepper { display: inline-flex; align-items: center; gap: 24px; border: 1px solid var(--kh-border); padding: 10px 24px; border-radius: 4px; background: rgba(0,0,0,0.2); width: fit-content; }
      .kh-stepper button { border: none; background: none; font-size: 20px; color: var(--kh-gold); cursor: pointer; font-weight: bold; }
      .kh-stepper span { font-size: 18px; font-weight: bold; font-family: 'Inter', sans-serif; min-width: 20px; text-align: center; }

      .kh-select, .kh-textarea { width: 100%; border: 1px solid var(--kh-border); background: rgba(0,0,0,0.3); padding: 14px; font-family: 'Inter', sans-serif; font-size: 15px; color: var(--kh-gold-light); border-radius: 4px; outline: none; }
      .kh-select:focus, .kh-textarea:focus { border-color: var(--kh-gold); }
      .kh-select option { background: var(--kh-bg); }
      .kh-textarea { resize: none; font-family: 'Abhaya Libre', serif; font-size: 18px; }

      .kh-submit-btn { width: 100%; padding: 16px; background: var(--kh-gold); color: var(--kh-dark); border: none; font-family: 'Cinzel', serif; font-size: 14px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: background 0.2s; }
      .kh-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .kh-submit-error { font-size: 13px; color: #ff6b6b; margin-top: 12px; text-align: center; font-family: 'Inter', sans-serif; }

      .kh-rsvp-summary { text-align: center; }
      .kh-rsvp-summary-heading { font-family: 'Cinzel', serif; font-size: 22px; color: var(--kh-gold); margin-bottom: 12px; font-weight: 600; }
      .kh-rsvp-summary-line { font-size: 16px; color: rgba(245,230,196,0.8); margin-bottom: 8px; font-family: 'Inter', sans-serif; }

      .kh-calendar-block { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--kh-border); display: flex; flex-direction: column; gap: 16px; }
      .kh-calendar-row { display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 4px; border: 1px solid var(--kh-border); }
      .kh-calendar-row-label { font-size: 16px; font-weight: 600; color: #FFF; font-family: 'Cinzel', serif; }
      .kh-calendar-row-actions { display: flex; gap: 12px; flex-wrap: wrap; }

      /* Footer */
      .kh-footer { text-align: center; padding: 80px 24px; background: var(--kh-dark); border-top: 1px solid var(--kh-border); }
      .kh-footer-monogram { font-family: 'Cinzel', serif; font-size: 48px; color: var(--kh-gold); margin-bottom: 16px; letter-spacing: 0.1em; }
      .kh-footer-line { font-size: 18px; font-style: italic; color: rgba(245,230,196,0.5); }

      @media (prefers-reduced-motion: reduce) { .kh-root * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
    `}</style>
  );
}