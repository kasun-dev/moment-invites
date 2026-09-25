'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, Clock, Loader2 } from 'lucide-react';

// ── Inline Traditional Sri Lankan Motif Components ───────────────────────────

function TraditionalGaja({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#D4AF37" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Ceremonial Tusker / Elephant Contour Silhouette */}
        <path d="M20,100 C30,80 50,75 70,75 C95,75 120,65 140,80 C155,90 165,110 170,125 C172,130 178,125 180,110 C182,90 175,60 150,50 C125,40 100,45 80,45 C50,45 30,55 20,70 Z" />
        {/* Traditional Liya-vela decorative lines on the rug */}
        <path d="M70,75 Q95,100 120,75 M80,85 Q95,105 110,85 M75,55 Q95,65 115,55" strokeWidth="0.8" />
        {/* Trunk and Tusk details */}
        <path d="M20,100 Q10,105 5,120 Q0,135 10,140 Q20,145 15,130 Q10,115 25,110" strokeWidth="1.5" />
        <path d="M22,112 Q35,115 45,108" strokeWidth="2" stroke="#FFF" /> {/* Tusk */}
        {/* Ceremonial Netthimala / Head Dress */}
        <path d="M30,70 Q40,60 45,75 M35,65 Q42,58 48,68" />
        <circle cx="38" cy="68" r="1.5" fill="#D4AF37" />
        {/* Feet and Tail */}
        <path d="M45,120 L40,150 L55,150 L55,122 M135,120 L135,150 L150,150 L145,120" strokeWidth="1.5" />
        <path d="M170,115 Q175,125 172,145" />
      </g>
    </svg>
  );
}

function PoruwaSunMandala({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(200,200)" fill="none" stroke="#D4AF37" strokeWidth="0.8">
        {/* Concentric rings representing cosmic layers */}
        <circle r="185" strokeWidth="1.5" /><circle r="175" strokeDasharray="4,4" /><circle r="150" /><circle r="120" /><circle r="85" /><circle r="50" /><circle r="20" />
        {/* Traditional Hansa / Flame Sharp Rays (24-point setup) */}
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(deg => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-20" x2="0" y2="-175" />
            <path d="M0,-120 Q8,-140 0,-150 Q-8,-140 0,-120Z" fill="rgba(212,175,55,0.1)" />
            <path d="M0,-85 Q12,-100 0,-120 Q-12,-100 0,-85Z" />
            <circle cx="0" cy="-165" r="3" fill="#D4AF37" />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── PunkalasaDivider ─────────────────────────────────────────────────────────

function PunkalasaDivider() {
  return (
    <div className="k-divider">
      <div className="k-divider-line"></div>
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Traditional Punkalasa Vas / Pot of Plenty Symbolizing Prosperity */}
        <g transform="translate(16,16)" stroke="#D4AF37" strokeWidth="1" fill="none">
          <path d="M-8,6 C-10,0 -8,-6 0,-8 C8,-6 10,0 8,6 C6,10 4,11 0,11 C-4,11 -6,10 -8,6 Z" fill="rgba(212,175,55,0.05)" />
          <path d="M-4,-8 C-6,-12 0,-14 0,-14 C0,-14 6,-12 4,-8 Z" /> {/* Coconut leaves sprout */}
          <path d="M-6,11 L6,11 M-5,13 L5,13" strokeWidth="1.5" /> {/* Base Stand */}
          <circle cx="0" cy="-1" r="3" />
        </g>
      </svg>
      <div className="k-divider-line rev"></div>
    </div>
  );
}

function KandyanKshanaSuccess() {
  return (
    <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

// ── HeritageKandyanCheckbox Component ────────────────────────────────────────

function HeritageKandyanCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <div onClick={onChange} className="k-guest-row select-none">
      <div className={`k-check ${checked ? 'on' : ''}`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#800000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="k-checkbox-label">{label}</span>
    </div>
  );
}

// ── Main Component Template ──────────────────────────────────────────────────

export default function KandyanHeritageTemplate({ event, guest, subGuestsInitial }: any) {
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

  const eventDateFormatted = new Date(event.event_date).toLocaleDateString('si-LK', { dateStyle: 'full' });
  const eventTimeFormatted = new Date(event.event_date).toLocaleTimeString('si-LK', { hour: 'numeric', minute: '2-digit' });

  // DEFINED IN COMPONENT SCOPE
  const generateMonogram = (titleString: string) => {
    if (!titleString) return "M & Y";
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&display=swap');

        .kandyan-root {
          box-sizing: border-box;
          background: #3A0007; 
          background-image: radial-gradient(circle at center, #52000B 0%, #1F0003 100%);
          font-family: 'Abhaya Libre', serif;
          color: #F5E6C4;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Hero banner configurations */
        .k-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          position: relative;
        }
        .k-sun-mandala {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 600px;
          opacity: 0.08;
          animation: k-spin-forward 140s linear infinite;
          pointer-events: none;
        }
        @keyframes k-spin-forward {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .k-gaja-left { position: absolute; left: -30px; bottom: 40px; width: 220px; opacity: 0.15; pointer-events: none; transform: scaleX(1); }
        .k-gaja-right { position: absolute; right: -30px; bottom: 40px; width: 220px; opacity: 0.15; pointer-events: none; transform: scaleX(-1); }

        .k-ayubowan-badge {
          font-family: 'Abhaya Libre', serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.15em;
          color: #D4AF37; 
          margin-bottom: 20px;
          border: 1px solid rgba(212,175,55,0.3);
          padding: 6px 24px;
          background: rgba(31,0,3,0.4);
          border-radius: 4px;
        }
        .k-title-names {
          font-family: 'Cinzel', serif;
          font-size: clamp(34px, 7vw, 56px);
          font-weight: 600;
          color: #FFF;
          text-shadow: 0 4px 12px rgba(0,0,0,0.6);
          line-height: 1.2;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
        }
        .k-subtitle-date {
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #D4AF37;
          margin-bottom: 40px;
        }
        .k-scroll-indicator {
          font-size: 13px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,230,196,0.4);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          margin-top: 40px;
        }
        .k-scroll-track {
          width: 2px; height: 50px;
          background: linear-gradient(to bottom, #D4AF37, transparent);
        }

        /* Generic Section Blocks */
        .k-section { padding: 80px 24px; max-width: 680px; margin: 0 auto; text-align: center; }
        .k-section-label { display: block; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: #D4AF37; margin-bottom: 16px; font-weight: 700; }
        .k-section-title { font-family: 'Cinzel', serif; font-size: 32px; font-weight: 500; color: #FFF; margin-bottom: 24px; }

        /* Ceremonial Poruwa Invitation Card Layout */
        .k-poruwa-card {
          border: 2px solid #D4AF37;
          background: #2A0005;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border-radius: 4px;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }
        .k-poruwa-card::before {
          content: ''; position: absolute;
          top: 6px; left: 6px; right: 6px; bottom: 6px;
          border: 1px solid rgba(212,175,55,0.15);
          pointer-events: none;
        }
        .k-sinhala-greeting { font-size: 24px; font-weight: 700; color: #D4AF37; margin-bottom: 24px; font-family: 'Abhaya Libre', serif; }
        .k-formal-body { font-size: 18px; line-height: 1.8; color: #F5E6C4; font-weight: 400; }
        .k-guest-highlight { font-family: 'Cinzel', serif; font-size: 26px; color: #FFF; margin: 28px 0; font-style: normal; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }

        /* Divider Infrastructure */
        .k-divider { display: flex; align-items: center; gap: 16px; max-width: 360px; margin: 0 auto; }
        .k-divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, #D4AF37); }
        .k-divider-line.rev { background: linear-gradient(to left, transparent, #D4AF37); }

        /* Celebration Event Manifests */
        .k-celebration-box { background: #2A0005; border: 1px solid rgba(212,175,55,0.3); padding: 40px 32px; max-width: 500px; margin: 32px auto 0; position: relative; border-radius: 4px; }
        .k-time-display { font-family: 'Cinzel', serif; font-size: 34px; color: #FFF; margin: 12px 0; font-weight: 600; letter-spacing: 0.05em; }
        .k-location-title { font-size: 22px; font-weight: 700; color: #D4AF37; margin-bottom: 6px; }
        .k-location-sub { font-size: 15px; color: rgba(245,230,196,0.6); margin-bottom: 24px; }
        .k-action-map { display: inline-block; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #3A0007; background: #D4AF37; border: 1px solid #D4AF37; padding: 10px 28px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Abhaya Libre', serif; border-radius: 2px; }
        .k-action-map:hover { background: #FFF; border-color: #FFF; color: #1F0003; }

        /* RSVP Framework Structural Design */
        .k-rsvp-container { background: #2A0005; border: 2px solid #D4AF37; max-width: 540px; margin: 0 auto; padding: 48px 36px; border-radius: 4px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
        .k-rsvp-headline { font-family: 'Cinzel', serif; font-size: 24px; color: #FFF; margin-bottom: 6px; }
        .k-rsvp-subline { font-size: 15px; color: rgba(245,230,196,0.5); margin-bottom: 32px; }
        .k-toggle-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .k-toggle-btn { padding: 14px; border: 1px solid rgba(212,175,55,0.4); background: transparent; color: #D4AF37; font-family: 'Abhaya Libre', serif; font-size: 16px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; border-radius: 2px; }
        .k-toggle-btn:hover { background: rgba(212,175,55,0.1); }
        .k-btn-selected-yes { background: #D4AF37 !important; color: #3A0007 !important; border-color: #D4AF37 !important; }
        .k-btn-selected-no { background: #1F0003 !important; color: #F5E6C4 !important; border-color: #1F0003 !important; }
        
        .k-guest-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; text-align: left; }
        .k-guest-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 1px solid rgba(212,175,55,0.2); cursor: pointer; background: rgba(0,0,0,0.2); border-radius: 4px; transition: border-color 0.2s; }
        .k-guest-row:hover { border-color: #D4AF37; }
        .k-check { width: 22px; height: 22px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
        .k-check.on { background: #D4AF37; }
        .k-checkbox-label { font-size: 17px; color: #F5E6C4; font-weight: 500; }
        
        .k-fire-submit { width: 100%; padding: 16px; background: #D4AF37; border: none; color: #3A0007; font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; border-radius: 2px; }
        .k-fire-submit:hover:not(:disabled) { background: #FFF; color: #000; }
        .k-fire-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Transaction state styling */
        .k-success-block { text-align: center; padding: 16px 0; }
        .k-success-bloom { animation: k-pulse-bloom 0.5s ease-out; }
        @keyframes k-pulse-bloom { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
        .k-success-heading { font-family: 'Cinzel', serif; font-size: 22px; color: #D4AF37; margin-top: 20px; font-weight: 600; }
        .k-success-description { font-size: 16px; color: rgba(245,230,196,0.7); margin-top: 8px; }

        /* Master layout footer */
        .k-footer-block { background: #120002; padding: 80px 24px; text-align: center; border-top: 1px solid rgba(212,175,55,0.2); }
        .k-footer-mono { font-family: 'Cinzel', serif; font-size: 48px; font-weight: 400; color: #D4AF37; margin-bottom: 16px; letter-spacing: 0.1em; }
        .k-footer-msg { font-size: 18px; font-style: italic; color: rgba(245,230,196,0.5); max-width: 400px; margin: 0 auto; line-height: 1.8; }
      `}</style>

      <div className="kandyan-root">
        
        {/* ── HERO BANNER ── */}
        <section className="k-hero">
          <PoruwaSunMandala className="k-sun-mandala" />
          <TraditionalGaja className="k-gaja-left" />
          <TraditionalGaja className="k-gaja-right" />

          <div className="k-ayubowan-badge">ආයුබෝවන්</div>
          <p className="k-section-label" style={{ color: '#FFF', opacity: 0.6 }}>We Invite You To Celebrate With Us</p>
          <h1 className="k-title-names">{event.title}</h1>

          <p className="k-subtitle-date">{eventDateFormatted}</p>
          
          <div className="k-scroll-indicator">
            <span>මංගල ආරාධනාව</span>
            <div className="k-scroll-track"></div>
          </div>
        </section>

        {/* ── FORMAL INVITATION PORUWA FRAME ── */}
        <section className="k-section">
          <span className="k-section-label">Wedding Invitation</span>
          <div className="k-poruwa-card">
            <h3 className="k-sinhala-greeting">දේව ආශිර්වාදය මැද</h3>
            <p className="k-formal-body">
              Together with our families, we honorably solicit the pleasure of your presence to grace our auspicious marital union and bless the commencement of our shared life journey.
            </p>
            <div className="k-guest-highlight">Dear {guest.first_name},</div>
            <p className="k-formal-body" style={{ color: '#D4AF37', fontStyle: 'italic' }}>
              ඔබගේ පැමිණීම අපගේ සතුටයි.<br />
              Your presence on our special day remains our highest honor.
            </p>
          </div>
        </section>

        <PunkalasaDivider />

        {/* ── CEREMONIAL TIMES & DETAILS ── */}
        <section className="k-section" style={{ paddingTop: 0 }}>
          <span className="k-section-label">Auspicious Times</span>
          <h2 className="k-section-title">නැකත් සහ විස්තර</h2>
          
          <div className="k-celebration-box">
            <p className="k-section-label">Poruwa Ceremony & Celebration</p>
            <div className="k-time-display">{eventTimeFormatted}</div>
            <div style={{ width: 40, height: 1, background: '#D4AF37', margin: '16px auto' }}></div>
            <p className="k-location-title">{event.location}</p>
            <p className="k-location-sub">Honored Family Invitation Guest</p>
            
            <button 
              className="k-map-btn k-action-map" 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(event.location)}`, '_blank')}
            >
              Location Map
            </button>
          </div>
        </section>

        <PunkalasaDivider />

        {/* ── RSVP INTERACTION ZONE ── */}
        <section className="k-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
          <span className="k-section-label">RSVP Confirmation</span>
          <h2 className="k-section-title">ඔබගේ පැමිණීම අපට දන්වන්න</h2>
          
          <div className="k-rsvp-container">
            <p className="k-rsvp-headline">Welcome, {guest.first_name}</p>
            <p className="k-rsvp-subline">Kindly verify your reservation choices below</p>

            <div className="k-toggle-buttons">
              <button 
                className={`k-toggle-btn ${rsvpStatus === 'confirmed' ? 'k-btn-selected-yes' : ''}`}
                onClick={() => handleSetRsvp('confirmed')}
              >
                Joyfully Accept
              </button>
              <button 
                className={`k-toggle-btn ${rsvpStatus === 'declined' ? 'k-btn-selected-no' : ''}`}
                onClick={() => handleSetRsvp('declined')}
              >
                Regretfully Decline
              </button>
            </div>

            {/* Nested Multi-head Attending State Selectors */}
            {rsvpStatus === 'confirmed' && (
              <div className="k-guest-stack">
                <HeritageKandyanCheckbox 
                  checked={primaryAttending}
                  label={`${guest.first_name} (Primary Contact)`}
                  onChange={() => setPrimaryAttending(v => !v)}
                />
                {subGuests.map((sg: any) => (
                  <HeritageKandyanCheckbox 
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

            {/* Fire Action Mutations */}
            {!submitted && rsvpStatus !== 'pending' && (
              <button 
                className="k-fire-submit"
                onClick={submitRSVP}
                disabled={submitting}
              >
                {submitting ? 'Updating System…' : 'Submit Response'}
              </button>
            )}

            {/* Success Frame Render blocks */}
            {submitted && (
              <div className="k-success-block">
                <div className="k-success-bloom">
                  <KandyanKshanaSuccess />
                </div>
                <p className="k-success-heading">ස්තූතියි - Response Recorded</p>
                <p className="k-success-description">Your attendance choice has been cleanly captured.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── MASTER FOOTER LAYOUT ── */}
        <footer className="k-footer-block">
          <div className="k-footer-mono">{generateMonogram(event.title)}</div>
          <p className="k-footer-msg">
            Thank you for being part of our auspicious celebration.<br />
            We look forward to welcoming you.
          </p>
        </footer>
      </div>
    </>
  );
}