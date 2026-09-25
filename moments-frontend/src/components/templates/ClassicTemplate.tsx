'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// ── Inline SVG Mandala Components ────────────────────────────────────────────

function MandalaLarge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(200,200)" fill="none" stroke="#C5A059" strokeWidth="0.6">
        <circle r="190" /><circle r="160" /><circle r="130" /><circle r="100" /><circle r="70" /><circle r="40" />
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-40" x2="0" y2="-190" />
            <ellipse cx="0" cy="-115" rx="14" ry="28" />
            <ellipse cx="0" cy="-158" rx="8" ry="16" />
            <circle cx="0" cy="-190" r="4" />
            <path d="M0,-70 Q8,-100 0,-130 Q-8,-100 0,-70Z" />
            <path d="M0,-40 Q12,-55 0,-70 Q-12,-55 0,-40Z" />
          </g>
        ))}
        <circle r="20" /><circle r="10" />
      </g>
    </svg>
  );
}

function MandalaSmall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(100,100)" fill="none" stroke="#C5A059" strokeWidth="0.8">
        <circle r="90" /><circle r="60" /><circle r="30" />
        {[0,45,90,135,180,225,270,315].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-30" x2="0" y2="-90" />
            <ellipse cx="0" cy="-60" rx="7" ry="14" />
            <circle cx="0" cy="-90" r="3" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function MandalaMini() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(16,16)" stroke="#C5A059" strokeWidth="0.7" fill="none">
        <circle r="12" /><circle r="7" /><circle r="3" />
        {[0,60,120,180,240,300].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-3" x2="0" y2="-12" />
            <ellipse cx="0" cy="-7.5" rx="2" ry="4" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function MandalaSuccess() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(32,32)" stroke="#C5A059" strokeWidth="0.8" fill="none">
        <circle r="28" /><circle r="20" /><circle r="12" /><circle r="5" />
        {[0,45,90,135,180,225,270,315].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-5" x2="0" y2="-28" />
            <ellipse cx="0" cy="-16.5" rx="3.5" ry="7" />
            <circle cx="0" cy="-28" r="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function MandalaCardCorner() {
  return (
    <svg className="absolute top-2 right-2 w-8 h-8 opacity-[0.12]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(20,20)" stroke="#C5A059" strokeWidth="0.8" fill="none">
        <circle r="16" /><circle r="10" /><circle r="5" />
        {[0,45,90,135,180,225,270,315].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-5" x2="0" y2="-16" />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── GoldCheckbox ─────────────────────────────────────────────────────────────

function GoldCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none"
      style={{
        border: '1px solid rgba(197,160,89,0.25)',
        borderRadius: '2px',
        background: 'rgba(253,250,244,0.5)',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 transition-all"
        style={{
          width: 22, height: 22,
          borderRadius: '50%',
          border: checked ? 'none' : '1px solid rgba(197,160,89,0.45)',
          background: checked ? '#C5A059' : 'transparent',
          transition: 'background 0.2s, border 0.2s',
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#FDFAF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 16, color: '#3D3328' }}>{label}</span>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div className="flex items-center gap-4 max-w-xs mx-auto py-10">
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(197,160,89,0.4))' }} />
      <MandalaMini />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(197,160,89,0.4))' }} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ClassicTemplate({ event, guest, subGuestsInitial }: any) {
  const [rsvpStatus, setRsvpStatus] = useState<string>(guest.rsvp_status || 'pending');
  const [primaryAttending, setPrimaryAttending] = useState<boolean>(guest.is_attending || false);
  const [subGuests, setSubGuests] = useState<any[]>(subGuestsInitial || []);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(guest.rsvp_status !== 'pending');

  const handleSetRsvp = (status: string) => {
    setRsvpStatus(status);
    setSubmitted(false);
  };

  const submitRSVP = async () => {
    setSubmitting(true);
    try {
      await supabase.from('guests').update({
        rsvp_status: rsvpStatus,
        is_attending: rsvpStatus === 'confirmed' ? primaryAttending : false,
      }).eq('id', guest.id);

      if (subGuests.length > 0) {
        const updates = subGuests.map((sg: any) => ({
          id: sg.id,
          parent_guest_id: guest.id,
          full_name: sg.full_name,
          is_attending: rsvpStatus === 'confirmed' ? sg.is_attending : false,
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

  const eventDateFormatted = new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'full' });

  // Generate dynamic monogram (e.g., "K & D" from "Kavindra & Dilini")
  const generateMonogram = (titleString: string) => {
    if (!titleString) return "M";
    const parts = titleString.split(/&|and/i);
    if (parts.length >= 2) {
      const firstInitial = parts[0].trim().charAt(0).toUpperCase();
      const secondInitial = parts[1].trim().charAt(0).toUpperCase();
      return `${firstInitial} & ${secondInitial}`;
    }
    return titleString.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        :root {
          --ivory: #F7F4EC;
          --ivory-deep: #EDE8DC;
          --ivory-card: #FDFAF4;
          --gold: #C5A059;
          --gold-dark: #8B6914;
          --gold-pale: #F0E6CC;
          --border-gold: rgba(197, 160, 89, 0.35);
          --espresso: #2C1F0E;
          --charcoal: #3D3328;
          --muted: #7A6A52;
          --muted-light: #A8967C;
        }

        .wedding-root {
          background: var(--ivory);
          font-family: 'EB Garamond', Georgia, serif;
          color: var(--charcoal);
          min-height: 100vh;
        }

        /* Hero Layout */
        .w-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          position: relative;
          overflow: hidden;
        }
        .w-mandala-bg {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 520px; height: 520px;
          opacity: 0.06;
          animation: w-slowspin 120s linear infinite;
          pointer-events: none;
        }
        .w-mandala-bg-sm {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 260px; height: 260px;
          opacity: 0.08;
          animation: w-slowspin 80s linear infinite reverse;
          pointer-events: none;
        }
        @keyframes w-slowspin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .w-eyebrow {
          font-family: 'EB Garamond', serif;
          font-size: 11px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 32px;
        }
        .w-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 8vw, 56px);
          font-weight: 300;
          color: var(--espresso);
          line-height: 1.2;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
          max-width: 600px;
          text-transform: capitalize;
        }
        .w-hero-date {
          font-size: 16px;
          letter-spacing: 0.22em;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 48px;
        }
        .w-hero-rule {
          width: 80px; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          margin: 0 auto 20px;
        }
        .w-scroll-hint {
          font-size: 11px; letter-spacing: 0.35em;
          text-transform: uppercase; color: var(--muted-light);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .w-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, var(--gold), transparent);
          animation: w-pulse-line 2.5s ease-in-out infinite;
        }
        @keyframes w-pulse-line {
          0%,100% { opacity: 0.3; } 50% { opacity: 0.9; }
        }

        /* Layout Block Infrastructure */
        .w-section {
          padding: 80px 24px;
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }
        .w-section-label {
          display: block;
          font-size: 10px; letter-spacing: 0.5em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 24px;
        }
        .w-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px; font-weight: 300;
          color: var(--espresso); margin-bottom: 16px; line-height: 1.2;
        }
        .w-section-body {
          font-size: 17px; line-height: 1.8; color: var(--muted);
          max-width: 480px; margin: 0 auto;
        }

        /* Card Framing System */
        .w-formal-card {
          border: 1px solid var(--border-gold);
          background: var(--ivory-card);
          border-radius: 2px;
          padding: 56px 48px;
          max-width: 560px; margin: 0 auto;
          position: relative;
        }
        .w-formal-card::before, .w-formal-card::after {
          content: '';
          position: absolute;
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          border: 0.5px solid rgba(197,160,89,0.2);
          border-radius: 1px; pointer-events: none;
        }
        .w-formal-card::after {
          top: 14px; left: 14px; right: 14px; bottom: 14px;
          border-color: rgba(197,160,89,0.1);
        }
        .w-blessing {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-style: italic;
          color: var(--gold); letter-spacing: 0.05em; margin-bottom: 28px;
        }
        .w-formal-text { font-size: 17px; line-height: 1.85; color: var(--charcoal); }
        .w-guest-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 400; font-style: italic;
          color: var(--gold-dark); margin: 20px 0;
        }

        /* Event Matrix Grid */
        .w-event-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 600px; margin: 40px auto 0;
        }
        @media (max-width: 520px) { .w-event-grid { grid-template-columns: 1fr; } }
        .w-event-card {
          border: 1px solid var(--border-gold);
          background: var(--ivory-card);
          border-radius: 2px; padding: 32px 24px;
          text-align: center; position: relative; overflow: hidden;
        }
        .w-event-type {
          font-size: 9px; letter-spacing: 0.5em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 12px;
        }
        .w-event-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 300;
          color: var(--espresso); line-height: 1.2; margin-bottom: 16px;
        }
        .w-event-venue {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; color: var(--espresso); margin-bottom: 6px;
          white-space: normal; word-wrap: break-word;
        }
        .w-event-loc { font-size: 13px; color: var(--muted-light); margin-bottom: 18px; }
        .w-map-btn {
          display: inline-block; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); border: 1px solid var(--border-gold);
          padding: 7px 18px; border-radius: 1px; cursor: pointer;
          background: transparent; transition: background 0.2s;
          font-family: 'EB Garamond', serif;
        }
        .w-map-btn:hover { background: var(--gold-pale); }

        /* Form Controls */
        .w-rsvp-card {
          border: 1px solid var(--border-gold);
          background: var(--ivory-card);
          border-radius: 2px;
          padding: 52px 48px;
          max-width: 560px; margin: 0 auto;
        }
        @media (max-width: 520px) {
          .w-formal-card, .w-rsvp-card { padding: 40px 28px; }
        }
        .w-rsvp-welcome {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-style: italic;
          color: var(--espresso); margin-bottom: 8px;
        }
        .w-rsvp-sub {
          font-size: 14px; color: var(--muted);
          margin-bottom: 36px; letter-spacing: 0.04em;
        }
        .w-rsvp-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 36px; }
        .w-rsvp-btn {
          padding: 16px;
          border: 1px solid var(--border-gold);
          background: transparent; color: var(--muted);
          font-family: 'EB Garamond', serif; font-size: 15px;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 1px; transition: all 0.25s;
        }
        .w-rsvp-btn:hover { border-color: var(--gold); color: var(--gold-dark); }
        .w-rsvp-btn-accept { background: var(--gold) !important; border-color: var(--gold) !important; color: #FDFAF4 !important; }
        .w-rsvp-btn-decline { background: var(--charcoal) !important; border-color: var(--charcoal) !important; color: #FDFAF4 !important; }
        .w-guest-list { margin-bottom: 32px; display: flex; flex-direction: column; gap: 8px; }
        .w-confirm-btn {
          width: 100%; padding: 18px;
          background: var(--gold); border: none;
          color: #FDFAF4; font-family: 'EB Garamond', serif;
          font-size: 13px; letter-spacing: 0.35em;
          text-transform: uppercase; cursor: pointer;
          border-radius: 1px; transition: background 0.2s;
        }
        .w-confirm-btn:hover:not(:disabled) { background: var(--gold-dark); }
        .w-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Feedback Infrastructure */
        .w-success { text-align: center; padding: 12px 0; }
        .w-success-anim { animation: w-bloom 0.6s ease-out; }
        @keyframes w-bloom {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .w-success-msg {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-style: italic;
          color: var(--gold-dark); margin-top: 16px;
        }
        .w-success-sub { font-size: 14px; color: var(--muted); margin-top: 8px; letter-spacing: 0.04em; }

        /* Typography & Bounds Enforcement */
        .w-footer {
          padding: 72px 24px 60px;
          text-align: center;
          background: var(--espresso);
          position: relative; overflow: hidden;
        }
        .w-footer-mandala {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 320px; height: 320px;
          opacity: 0.06;
          animation: w-slowspin 90s linear infinite;
          pointer-events: none;
        }
        .w-monogram {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 300;
          color: var(--gold); letter-spacing: 0.15em;
          margin-bottom: 24px; position: relative;
        }
        .w-footer-msg {
          font-family: 'EB Garamond', serif;
          font-size: 18px; font-style: italic;
          color: rgba(240,230,204,0.7);
          max-width: 400px; margin: 0 auto 32px;
          line-height: 1.7; position: relative;
        }
        .w-footer-rule {
          width: 60px; height: 1px;
          background: var(--gold); opacity: 0.4;
          margin: 0 auto; position: relative;
        }
      `}</style>

      <div className="wedding-root">

        {/* ── HERO ── */}
        <section className="w-hero">
          <MandalaLarge className="w-mandala-bg" />
          <MandalaSmall className="w-mandala-bg-sm" />

          <p className="w-eyebrow">The Wedding of</p>
          <div className="w-names">{event.title}</div>

          <p className="w-hero-date">{eventDateFormatted}</p>
          <div className="w-hero-rule" />
          <div className="w-scroll-hint">
            <span>Scroll to Open</span>
            <div className="w-scroll-line" />
          </div>
        </section>

        {/* ── FORMAL INVITATION ── */}
        <section className="w-section">
          <span className="w-section-label">Formal Invitation</span>
          <div className="w-formal-card">
            <p className="w-blessing">ആയുഷ്മാൻ ഭവ:</p>
            <p className="w-formal-text">
              Together with their beloved families,<br /><br />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: 'var(--espresso)', fontStyle: 'italic', fontWeight: 500 }}>
                {event.title}
              </span>
              <br /><br />
              joyfully invite you to witness the celebration of their union
            </p>
            <div className="w-guest-name">Dear {guest.first_name},</div>
            <p className="w-formal-text" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
              Your presence would be the greatest gift<br />
              as we celebrate this sacred beginning.
            </p>
          </div>
        </section>

        <GoldDivider />

        {/* ── EVENT DETAILS ── */}
        <section className="w-section" style={{ paddingTop: 0 }}>
          <span className="w-section-label">Celebrations</span>
          <h2 className="w-section-title">Join Us At</h2>

          <div className="w-event-grid">
            <div className="w-event-card col-span-2 md:col-span-1 max-w-md mx-auto w-full">
              <MandalaCardCorner />
              <p className="w-event-type">Wedding Ceremony & Reception</p>
              <div className="w-event-time">
                {new Date(event.event_date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </div>
              <p className="w-event-venue">{event.location}</p>
              <p className="w-event-loc">Honored Guest Invitation</p>
              <button
                className="w-map-btn"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank')}
              >
                View on Map
              </button>
            </div>
          </div>
        </section>

        <GoldDivider />

        {/* ── RSVP ── */}
        <section className="w-section" style={{ paddingTop: 0, paddingBottom: 80 }}>
          <span className="w-section-label">Kindly Reply</span>
          <h2 className="w-section-title">Your Response</h2>
          <p className="w-section-body" style={{ marginBottom: 40 }}>
            Please update your attendance preference below so we may beautifully arrange the assembly.
          </p>

          <div className="w-rsvp-card">
            <p className="w-rsvp-welcome">Welcome, {guest.first_name}</p>
            <p className="w-rsvp-sub">We warmly await your response</p>

            {/* Accept / Decline Toggles */}
            <div className="w-rsvp-buttons">
              <button
                className={`w-rsvp-btn ${rsvpStatus === 'confirmed' ? 'w-rsvp-btn-accept' : ''}`}
                onClick={() => handleSetRsvp('confirmed')}
              >
                Accept
              </button>
              <button
                className={`w-rsvp-btn ${rsvpStatus === 'declined' ? 'w-rsvp-btn-decline' : ''}`}
                onClick={() => handleSetRsvp('declined')}
              >
                Decline
              </button>
            </div>

            {/* Attendance Manifest Configuration */}
            {rsvpStatus === 'confirmed' && (
              <div className="w-guest-list">
                <GoldCheckbox
                  checked={primaryAttending}
                  label={`${guest.first_name} (Primary Contact)`}
                  onChange={() => setPrimaryAttending(v => !v)}
                />
                {subGuests.map((sg: any) => (
                  <GoldCheckbox
                    key={sg.id}
                    checked={sg.is_attending}
                    label={sg.full_name}
                    onChange={() =>
                      setSubGuests(prev =>
                        prev.map((s: any) => s.id === sg.id ? { ...s, is_attending: !s.is_attending } : s)
                      )
                    }
                  />
                ))}
              </div>
            )}

            {/* Form Confirmation Fire Infrastructure */}
            {!submitted && rsvpStatus !== 'pending' && (
              <button
                className="w-confirm-btn"
                onClick={submitRSVP}
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Confirm Response'}
              </button>
            )}

            {/* Execution Confirmation Messaging */}
            {submitted && (
              <div className="w-success">
                <div className="w-success-anim">
                  <MandalaSuccess />
                </div>
                <p className="w-success-msg">Your response has been beautifully received</p>
                <p className="w-success-sub">We look forward to celebrating with you</p>
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="w-footer">
          <MandalaLarge className="w-footer-mandala" />
          <div className="w-monogram">{generateMonogram(event.title)}</div>
          <p className="w-footer-msg">
            Thank you for being a part of our story.<br />
            We cannot wait to celebrate with you.
          </p>
          <div className="w-footer-rule" />
        </footer>

      </div>
    </>
  );
}