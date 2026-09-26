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
}

// ────────────────────────────────────────────────────────────────────────────
// 1. THE ADAPTER WRAPPER (Bridges Supabase Data to the Template)
// ────────────────────────────────────────────────────────────────────────────

export default function KandyanHeritageTemplate({ event, guest, subGuestsInitial }: any) {
  const [subGuests] = useState<any[]>(subGuestsInitial || []);

  // Safe fallback while loading
  if (!event || !guest) return null;

  // Split "Kasun & Dewmi" into Groom and Bride names
  const parts = (event.title || 'Kasun & Dewmi').split(/&|and/i).map((s: string) => s.trim());
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
      venueName: ev.location.split(',')[0] || ev.location,
      venueAddress: ev.location,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`,
    })),
    dietaryOptions: event.ask_dietary ? ['Standard Menu', 'Vegetarian', 'Vegan', 'Halal', 'Specific Allergies'] : ['Standard Menu'],
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
    <InvitationTemplateUI 
       wedding={mappedWedding} 
       guest={mappedGuest} 
       onSubmitRsvp={handleSubmitRsvp} 
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
// Presentational atoms
// ────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mi-eyebrow">{children}</p>;
}

function Divider() {
  return (
    <div className="mi-divider" aria-hidden="true">
      <span />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5c2.5 2 2.5 4 0 6.5-2.5-2.5-2.5-4.5 0-6.5Z"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <path
          d="M9 16.5c-2.5-2-2.5-4 0-6.5 2.5 2.5 2.5 4.5 0 6.5Z"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      </svg>
      <span />
    </div>
  );
}

function WaxSeal({ initials, onTap }: { initials: string; onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="mi-seal group"
      aria-label="Open invitation"
    >
      <svg viewBox="0 0 120 120" className="mi-seal-ring" aria-hidden="true">
        <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(250,247,242,0.55)" strokeWidth="0.75" />
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const x1 = 60 + Math.cos(angle) * 50;
          const y1 = 60 + Math.sin(angle) * 50;
          const x2 = 60 + Math.cos(angle) * 55;
          const y2 = 60 + Math.sin(angle) * 55;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(250,247,242,0.4)"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
      <span className="mi-seal-face">{initials}</span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. The Original UI Template
// ────────────────────────────────────────────────────────────────────────────

type Stage = 'sealed' | 'opening' | 'open';
type RsvpChoice = 'undecided' | 'attending' | 'declining';

function InvitationTemplateUI({
  wedding,
  guest,
  onSubmitRsvp,
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
    return () => {
      document.body.style.overflow = '';
    };
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

  const confirmedEventsForCalendar =
    choice === 'attending'
      ? allowedEvents.filter((e) => selectedEvents.includes(e.id))
      : [];

  const weddingTitle = `${wedding.groomName} & ${wedding.brideName}`;

  return (
    <div className="mi-root">
      <FontLoader />
      <GlobalStyles />

      {wedding.ambientAudioUrl && (
        <audio ref={audioRef} src={wedding.ambientAudioUrl} loop preload="none" />
      )}

      {/* ── Floating mute toggle ── */}
      {stage === 'open' && wedding.ambientAudioUrl && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="mi-mute-toggle"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* ── Stage 1 & 2 — Envelope + Wax Seal ── */}
      <AnimatePresence>
        {stage !== 'open' && (
          <motion.div
            className="mi-envelope-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.6, delay: 0.7 }}
          >
            <div className="mi-grain" aria-hidden="true" />

            <motion.div
              className="mi-envelope-flap"
              animate={
                stage === 'opening' && !prefersReducedMotion
                  ? { rotateX: -165 }
                  : { rotateX: 0 }
              }
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            />

            <motion.div
              className="mi-envelope-card"
              animate={
                stage === 'opening'
                  ? { y: prefersReducedMotion ? -8 : -180, opacity: prefersReducedMotion ? 0 : 1 }
                  : { y: 0, opacity: 1 }
              }
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mi-envelope-kicker">Warmly inviting</p>
              <p className="mi-envelope-guest">{guest.fullName}</p>
            </motion.div>

            <div className="mi-envelope-seal-wrap">
              <WaxSeal initials={wedding.monogramInitials} onTap={openInvitation} />
              {stage === 'sealed' && <p className="mi-tap-hint">Tap the seal to open</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage 3 — The Stationery Suite ── */}
      {stage === 'open' && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Hero */}
          <section className="mi-hero">
            <div className="mi-grain" aria-hidden="true" />
            <SectionLabel>Together with their families</SectionLabel>
            <h1 className="mi-hero-names">
              {wedding.groomName}
              <span className="mi-hero-amp">&amp;</span>
              {wedding.brideName}
            </h1>
            <div className="mi-hero-portrait">
              <img src={wedding.heroImageUrl} alt={`${weddingTitle} portrait`} />
            </div>

            {countdown && (
              <div className="mi-countdown">
                {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                  <div key={unit} className="mi-countdown-cell">
                    <span className="mi-countdown-num">
                      {String(countdown[unit]).padStart(2, '0')}
                    </span>
                    <span className="mi-countdown-label">{unit}</span>
                  </div>
                ))}
              </div>
            )}

            <ChevronDown className="mi-scroll-cue" size={18} strokeWidth={1.25} />
          </section>

          {/* Sub-events */}
          <section className="mi-section">
            <SectionLabel>Details</SectionLabel>
            <h2 className="mi-section-title">The Celebrations</h2>
            <Divider />

            <div className="mi-events-stack">
              {allowedEvents.map((ev) => (
                <article key={ev.id} className="mi-event-card">
                  <h3 className="mi-event-title">{ev.title}</h3>
                  <p className="mi-event-date">{ev.date}</p>
                  <p className="mi-event-time">{ev.time}</p>

                  {ev.auspiciousTimeNote && (
                    <div className="mi-nakath">{ev.auspiciousTimeNote}</div>
                  )}

                  <div className="mi-event-venue">
                    <p className="mi-event-venue-name">{ev.venueName}</p>
                    <p className="mi-event-venue-address">{ev.venueAddress}</p>
                  </div>

                  {ev.dressCode && (
                    <p className="mi-event-dresscode">Dress code · {ev.dressCode}</p>
                  )}

                  <button
                    type="button"
                    className="mi-outline-btn"
                    onClick={() => window.open(ev.mapUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <MapPin size={14} /> View location
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* RSVP */}
          <section className="mi-section mi-rsvp-section">
            <SectionLabel>Kindly respond by {wedding.rsvpDeadline}</SectionLabel>
            <h2 className="mi-section-title">Will You Join Us</h2>
            <Divider />

            <div className="mi-rsvp-card">
              {!editing && hasExistingRsvp ? (
                <RsvpSummary
                  choice={choice}
                  guestCount={guestCount}
                  dietary={dietary}
                  events={allowedEvents.filter((e) =>
                    (guest.currentRsvp?.attendingSubEvents ?? []).includes(e.id)
                  )}
                  onEdit={() => {
                    setEditing(true);
                    setSubmitStatus('idle');
                  }}
                />
              ) : (
                <>
                  <p className="mi-rsvp-greeting">Dear {guest.fullName.split(' ')[0]},</p>

                  <div className="mi-choice-row">
                    <button
                      type="button"
                      className={`mi-choice-btn ${choice === 'attending' ? 'is-selected-yes' : ''}`}
                      onClick={() => setChoice('attending')}
                    >
                      Joyfully Accept
                    </button>
                    <button
                      type="button"
                      className={`mi-choice-btn ${choice === 'declining' ? 'is-selected-no' : ''}`}
                      onClick={() => setChoice('declining')}
                    >
                      Regretfully Decline
                    </button>
                  </div>

                  {choice === 'attending' && (
                    <div className="mi-rsvp-fields">
                      <div className="mi-field-group">
                        <span className="mi-field-label">Which celebrations will you attend?</span>
                        {allowedEvents.map((ev) => (
                          <label key={ev.id} className="mi-checkbox-row">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(ev.id)}
                              onChange={() => toggleEvent(ev.id)}
                            />
                            {ev.title}
                          </label>
                        ))}
                      </div>

                      <div className="mi-field-group">
                        <span className="mi-field-label">
                          Number attending (up to {guest.maxAllowedGuests})
                        </span>
                        <div className="mi-stepper">
                          <button
                            type="button"
                            onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                            aria-label="Decrease guest count"
                          >
                            −
                          </button>
                          <span>{guestCount}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setGuestCount((n) => Math.min(guest.maxAllowedGuests, n + 1))
                            }
                            aria-label="Increase guest count"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mi-field-group">
                        <label className="mi-field-label" htmlFor="mi-dietary">
                          Dietary preference
                        </label>
                        <select
                          id="mi-dietary"
                          className="mi-select"
                          value={dietary}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setDietary(e.target.value)
                          }
                        >
                          {wedding.dietaryOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mi-field-group">
                        <label className="mi-field-label" htmlFor="mi-wish">
                          A message for the couple (optional)
                        </label>
                        <textarea
                          id="mi-wish"
                          className="mi-textarea"
                          value={wish}
                          onChange={(e) => setWish(e.target.value)}
                          placeholder="Wishing you a lifetime of happiness…"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {choice !== 'undecided' && (
                    <button
                      type="button"
                      className="mi-submit-btn"
                      onClick={submit}
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : 'Send Response'}
                    </button>
                  )}

                  {submitStatus === 'error' && (
                    <p className="mi-submit-error">
                      Something went wrong sending your response — please try again.
                    </p>
                  )}
                </>
              )}

              {submitStatus === 'success' && confirmedEventsForCalendar.length > 0 && (
                <div className="mi-calendar-block">
                  <p className="mi-field-label">Save the date</p>
                  {confirmedEventsForCalendar.map((ev) => {
                    const gcalUrl = buildGoogleCalendarUrl(ev, weddingTitle);
                    return (
                      <div key={ev.id} className="mi-calendar-row">
                        <span className="mi-calendar-row-label">{ev.title}</span>
                        <div className="mi-calendar-row-actions">
                          {gcalUrl && (
                            <button
                              type="button"
                              className="mi-outline-btn"
                              onClick={() => window.open(gcalUrl, '_blank', 'noopener,noreferrer')}
                            >
                              <CalendarPlus size={14} /> Google
                            </button>
                          )}
                          <button
                            type="button"
                            className="mi-outline-btn"
                            onClick={() => downloadICS(ev, weddingTitle)}
                          >
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

          <footer className="mi-footer">
            <p className="mi-footer-monogram">{wedding.monogramInitials}</p>
            <p className="mi-footer-line">With love and gratitude for your presence.</p>
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
    <div className="mi-rsvp-summary">
      <p className="mi-rsvp-summary-heading">
        {choice === 'attending' ? 'You are joining us' : 'Response recorded'}
      </p>
      {choice === 'attending' && (
        <>
          <p className="mi-rsvp-summary-line">
            {guestCount} guest{guestCount > 1 ? 's' : ''} · {dietary}
          </p>
          <p className="mi-rsvp-summary-line">
            {events.map((e) => e.title).join(', ') || 'No celebrations selected'}
          </p>
        </>
      )}
      <button type="button" className="mi-outline-btn" onClick={onEdit}>
        Update response
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Fonts + global styles
// ────────────────────────────────────────────────────────────────────────────

function FontLoader() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap"
    />
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .mi-root {
        --mi-ivory: #FAF7F2;
        --mi-champagne: #F1E9DE;
        --mi-ink: #2B2A28;
        --mi-brass: #B08D57;
        --mi-brass-light: #D9C6A3;
        --mi-seal: #6E2430;
        --mi-seal-dark: #521A23;
        font-family: 'Inter', system-ui, sans-serif;
        color: var(--mi-ink);
        background: var(--mi-ivory);
        min-height: 100dvh;
        overflow-x: hidden;
        -webkit-tap-highlight-color: transparent;
      }

      .mi-grain {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.05;
        mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      }

      /* ── Envelope stage ── */
      .mi-envelope-screen {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 30%, var(--mi-champagne) 0%, var(--mi-ivory) 70%);
        padding: env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px);
        perspective: 1400px;
      }

      .mi-envelope-flap {
        position: absolute;
        top: calc(50% - 118px);
        width: 240px;
        height: 130px;
        background: linear-gradient(160deg, var(--mi-brass-light), var(--mi-brass));
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        transform-origin: top center;
        box-shadow: 0 6px 18px rgba(43,42,40,0.12);
      }

      .mi-envelope-card {
        position: relative;
        width: 260px;
        min-height: 150px;
        background: var(--mi-ivory);
        border: 1px solid rgba(176,141,87,0.35);
        box-shadow: 0 18px 40px rgba(43,42,40,0.16);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 28px 20px;
        margin-top: 6px;
      }

      .mi-envelope-kicker {
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--mi-brass);
        margin-bottom: 10px;
      }

      .mi-envelope-guest {
        font-family: 'Cormorant Garamond', serif;
        font-size: 24px;
        font-style: italic;
        color: var(--mi-ink);
      }

      .mi-envelope-seal-wrap {
        position: absolute;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 64px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .mi-seal {
        position: relative;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        background: radial-gradient(circle at 35% 30%, var(--mi-seal) 0%, var(--mi-seal-dark) 75%);
        box-shadow: 0 10px 22px rgba(82,26,35,0.4), inset 0 2px 4px rgba(255,255,255,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      .mi-seal:active { transform: scale(0.92); }

      .mi-seal-ring {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .mi-seal-face {
        position: relative;
        font-family: 'Cinzel', serif;
        font-size: 20px;
        font-weight: 600;
        color: var(--mi-brass-light);
        letter-spacing: 0.05em;
      }

      .mi-tap-hint {
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(43,42,40,0.45);
      }

      .mi-mute-toggle {
        position: fixed;
        right: max(16px, env(safe-area-inset-right, 0px));
        bottom: max(16px, env(safe-area-inset-bottom, 0px));
        z-index: 40;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(176,141,87,0.4);
        background: rgba(250,247,242,0.9);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--mi-brass);
      }

      /* ── Hero ── */
      .mi-hero {
        position: relative;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: calc(env(safe-area-inset-top, 0px) + 56px) 24px 48px;
      }

      .mi-eyebrow {
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--mi-brass);
        margin-bottom: 14px;
      }

      .mi-hero-names {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        font-size: clamp(34px, 9vw, 52px);
        line-height: 1.15;
        margin-bottom: 28px;
      }
      .mi-hero-amp {
        display: block;
        font-style: italic;
        font-size: 0.55em;
        color: var(--mi-brass);
        margin: 4px 0;
      }

      .mi-hero-portrait {
        width: min(280px, 72vw);
        aspect-ratio: 4 / 5;
        border: 1px solid rgba(176,141,87,0.4);
        padding: 6px;
        margin-bottom: 32px;
      }
      .mi-hero-portrait img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .mi-countdown {
        display: flex;
        gap: 20px;
      }
      .mi-countdown-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .mi-countdown-num {
        font-family: 'Cormorant Garamond', serif;
        font-size: 28px;
        color: var(--mi-ink);
      }
      .mi-countdown-label {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(43,42,40,0.45);
        margin-top: 2px;
      }

      .mi-scroll-cue {
        margin-top: 40px;
        color: var(--mi-brass);
      }

      /* ── Sections ── */
      .mi-section {
        max-width: 560px;
        margin: 0 auto;
        padding: 72px 24px;
        text-align: center;
      }

      .mi-section-title {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        font-size: 30px;
        margin-bottom: 20px;
      }

      .mi-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: var(--mi-brass);
        max-width: 220px;
        margin: 0 auto 40px;
      }
      .mi-divider span {
        flex: 1;
        height: 1px;
        background: rgba(176,141,87,0.4);
      }

      .mi-events-stack {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .mi-event-card {
        border: 1px solid rgba(176,141,87,0.3);
        background: var(--mi-champagne);
        padding: 32px 24px;
        text-align: center;
      }
      .mi-event-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 22px;
        margin-bottom: 8px;
      }
      .mi-event-date { font-size: 14px; color: rgba(43,42,40,0.75); }
      .mi-event-time { font-size: 14px; color: rgba(43,42,40,0.55); margin-bottom: 14px; }

      .mi-nakath {
        display: inline-block;
        border: 1px dashed rgba(176,141,87,0.5);
        padding: 8px 16px;
        font-size: 13px;
        color: var(--mi-brass);
        margin-bottom: 18px;
      }

      .mi-event-venue-name { font-size: 16px; font-weight: 600; }
      .mi-event-venue-address {
        font-size: 13px;
        color: rgba(43,42,40,0.55);
        margin-bottom: 12px;
      }
      .mi-event-dresscode {
        font-size: 12px;
        letter-spacing: 0.04em;
        color: rgba(43,42,40,0.6);
        margin-bottom: 18px;
      }

      .mi-outline-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        letter-spacing: 0.06em;
        border: 1px solid var(--mi-brass);
        color: var(--mi-brass);
        background: transparent;
        padding: 10px 18px;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
      }
      .mi-outline-btn:hover { background: var(--mi-brass); color: var(--mi-ivory); }

      /* ── RSVP ── */
      .mi-rsvp-card {
        border: 1px solid rgba(176,141,87,0.35);
        background: var(--mi-ivory);
        padding: 40px 28px;
        text-align: left;
      }
      .mi-rsvp-greeting {
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        font-style: italic;
        text-align: center;
        margin-bottom: 24px;
      }

      .mi-choice-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 28px;
      }
      .mi-choice-btn {
        padding: 13px;
        font-size: 13px;
        border: 1px solid rgba(176,141,87,0.5);
        background: transparent;
        color: var(--mi-brass);
        cursor: pointer;
      }
      .is-selected-yes { background: var(--mi-brass) !important; color: var(--mi-ivory) !important; }
      .is-selected-no { background: var(--mi-ink) !important; color: var(--mi-ivory) !important; border-color: var(--mi-ink) !important; }

      .mi-rsvp-fields { display: flex; flex-direction: column; gap: 22px; margin-bottom: 24px; }
      .mi-field-label {
        display: block;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--mi-brass);
        margin-bottom: 10px;
      }
      .mi-checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        margin-bottom: 8px;
        cursor: pointer;
      }
      .mi-checkbox-row input { accent-color: var(--mi-brass); width: 16px; height: 16px; }

      .mi-stepper {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        border: 1px solid rgba(176,141,87,0.4);
        padding: 8px 18px;
      }
      .mi-stepper button {
        border: none;
        background: none;
        font-size: 18px;
        color: var(--mi-brass);
        cursor: pointer;
        line-height: 1;
      }

      .mi-select, .mi-textarea {
        width: 100%;
        border: 1px solid rgba(176,141,87,0.4);
        background: var(--mi-ivory);
        padding: 12px 14px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--mi-ink);
      }
      .mi-textarea { resize: none; }

      .mi-submit-btn {
        width: 100%;
        padding: 15px;
        background: var(--mi-brass);
        color: var(--mi-ivory);
        border: none;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .mi-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .mi-submit-error { font-size: 13px; color: var(--mi-seal); margin-top: 12px; text-align: center; }

      .mi-rsvp-summary { text-align: center; }
      .mi-rsvp-summary-heading {
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        margin-bottom: 8px;
      }
      .mi-rsvp-summary-line { font-size: 14px; color: rgba(43,42,40,0.65); margin-bottom: 6px; }

      .mi-calendar-block {
        margin-top: 28px;
        padding-top: 24px;
        border-top: 1px solid rgba(176,141,87,0.25);
      }
      .mi-calendar-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .mi-calendar-row-label { font-size: 14px; }
      .mi-calendar-row-actions { display: flex; gap: 8px; }

      .mi-footer {
        text-align: center;
        padding: 64px 24px calc(env(safe-area-inset-bottom, 0px) + 64px);
        background: var(--mi-champagne);
      }
      .mi-footer-monogram {
        font-family: 'Cinzel', serif;
        font-size: 34px;
        color: var(--mi-brass);
        margin-bottom: 12px;
      }
      .mi-footer-line { font-size: 14px; font-style: italic; color: rgba(43,42,40,0.55); }

      @media (prefers-reduced-motion: reduce) {
        .mi-root * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
    `}</style>
  );
}