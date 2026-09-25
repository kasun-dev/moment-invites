'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, Clock, Loader2 } from 'lucide-react';

// ── Inline SVG Lily Graphic Corner & Decorative Elements ─────────────────────

function LilyLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#7C8C74" strokeWidth="1.2" fill="none">
        <path d="M80,490 Q90,380 120,300 Q150,220 160,100" strokeWidth="1.8"/>
        <path d="M110,380 Q80,340 60,300 Q40,270 20,260"/>
        <path d="M130,300 Q110,260 100,220 Q90,190 95,160"/>
        <path d="M145,220 Q130,180 135,140 Q138,110 160,100"/>
        <path d="M160,100 Q150,70 140,50 Q135,30 145,10" stroke="#7C8C74"/>
        <path d="M160,100 Q175,72 182,52 Q188,32 178,12" stroke="#7C8C74"/>
        <path d="M160,100 Q168,74 180,62 Q195,50 205,38" stroke="#7C8C74"/>
        <path d="M160,100 Q145,76 135,66 Q120,56 112,42" stroke="#7C8C74"/>
        <path d="M160,100 Q155,72 148,58 Q140,44 135,28" stroke="#7C8C74"/>
        <path d="M160,100 Q172,76 178,64 Q185,50 185,34" stroke="#7C8C74"/>
        <circle cx="160" cy="100" r="5" fill="#7C8C74" opacity="0.6"/>
        <path d="M100,220 Q82,195 72,175 Q64,155 70,135"/>
        <path d="M100,220 Q118,197 126,177 Q133,157 127,137"/>
        <path d="M100,220 Q110,196 122,186 Q137,176 145,164"/>
        <path d="M100,220 Q88,198 76,190 Q62,183 56,170"/>
        <circle cx="100" cy="220" r="4" fill="#7C8C74" opacity="0.5"/>
        <path d="M60,300 Q38,278 28,258 Q20,240 26,220"/>
        <path d="M60,300 Q80,278 88,258 Q95,240 89,220"/>
        <path d="M60,300 Q70,276 82,268 Q96,260 104,248"/>
        <path d="M60,300 Q48,278 36,272 Q22,266 16,254"/>
        <circle cx="60" cy="300" r="4" fill="#7C8C74" opacity="0.4"/>
        <path d="M120,340 Q90,310 70,320 Q60,325 62,340 Q90,355 120,340Z" fill="#7C8C74" opacity="0.15"/>
        <path d="M135,270 Q106,248 90,258 Q80,264 84,278 Q106,290 135,270Z" fill="#7C8C74" opacity="0.12"/>
        <path d="M148,200 Q125,180 112,192 Q104,200 110,212 Q128,220 148,200Z" fill="#7C8C74" opacity="0.1"/>
        <path d="M155,160 Q145,140 140,120 Q138,110 144,105"/>
        <path d="M155,160 Q162,138 164,118 Q164,108 158,105"/>
        <ellipse cx="155" cy="155" rx="6" ry="12" fill="#7C8C74" opacity="0.2"/>
      </g>
    </svg>
  );
}

function LilyRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 440" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#7C8C74" strokeWidth="1.2" fill="none">
        <path d="M180,430 Q170,330 140,250 Q120,180 100,80" strokeWidth="1.8"/>
        <path d="M155,340 Q180,300 200,270 Q215,248 230,240"/>
        <path d="M130,260 Q155,220 160,180 Q162,150 148,130"/>
        <path d="M100,80 Q88,54 80,34 Q76,14 84,0"/>
        <path d="M116,56 120,36 Q124,16 114,2"/>
        <path d="M100,80 Q110,56 124,46 Q140,36 148,24"/>
        <path d="M100,80 Q86,58 72,50 Q58,42 52,28"/>
        <circle cx="100" cy="80" r="5" fill="#7C8C74" opacity="0.6"/>
        <path d="M148,130 Q132,108 124,88 Q118,70 124,54"/>
        <path d="M148,130 Q162,108 168,88 Q172,70 164,54"/>
        <path d="M148,130 Q160,110 172,102 Q186,94 192,82"/>
        <circle cx="148" cy="130" r="4" fill="#7C8C74" opacity="0.5"/>
        <path d="M140,310 Q168,284 188,294 Q196,300 192,314 Q168,326 140,310Z" fill="#7C8C74" opacity="0.15"/>
        <path d="M132,230 Q158,210 174,220 Q182,228 176,240 Q154,250 132,230Z" fill="#7C8C74" opacity="0.12"/>
        <path d="M115,180 Q105,158 102,138 Q100,126 106,122"/>
        <path d="M115,180 Q124,160 126,140 Q128,128 122,122"/>
        <ellipse cx="115" cy="175" rx="6" ry="11" fill="#7C8C74" opacity="0.18"/>
      </g>
    </svg>
  );
}

function LilyWatermark() {
  return (
    <svg className="lr-lily-bg" viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#7C8C74" strokeWidth="1" fill="none">
        <path d="M60,250 Q70,190 90,140 Q105,100 110,40" strokeWidth="1.5"/>
        <path d="M110,40 Q96,20 88,4 Q84,-8 92,-20"/>
        <path d="M110,40 Q122,22 126,6 Q128,-8 120,-18"/>
        <path d="M110,40 Q118,22 130,14 Q142,8 148,18"/>
        <path d="M110,40 Q100,24 90,18 Q78,12 76,24"/>
        <circle cx="110" cy="40" r="6" fill="#7C8C74" opacity="0.4"/>
        <path d="M88,130 Q64,118 54,128 Q48,136 56,146 Q76,152 88,130Z" fill="#7C8C74" opacity="0.2"/>
      </g>
    </svg>
  );
}

function LilyCardCorner() {
  return (
    <svg className="le-card-lily" viewBox="0 0 80 110" fill="none" aria-hidden="true">
      <g stroke="#7C8C74" strokeWidth="1" fill="none">
        <path d="M30,100 Q40,75 50,50 Q58,30 60,0" strokeWidth="1.4"/>
        <path d="M60,0 Q52,-6 48,6 Q44,16 52,22"/>
        <path d="M60,0 Q68,-4 70,8 Q70,18 62,22"/>
        <path d="M60,0 Q64,8 72,12 Q80,16 80,26"/>
        <circle cx="60" cy="0" r="4" fill="#7C8C74" opacity="0.5"/>
        <path d="M44,60 Q26,52 20,60 Q16,68 24,74 Q36,78 44,60Z" fill="#7C8C74" opacity="0.18"/>
      </g>
    </svg>
  );
}

function LilySuccess() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(30,30)" stroke="#7C8C74" strokeWidth="0.9" fill="none">
        <path d="M0,28 Q-6,18 -8,8 Q-9,0 -4,-6"/>
        <path d="M0,28 Q6,18 8,8 Q9,0 4,-6"/>
        <path d="M0,28 Q-10,20 -16,12 Q-20,4 -14,-2"/>
        <path d="M0,28 Q10,20 16,12 Q20,4 14,-2"/>
        <path d="M0,28 Q-8,22 -12,14"/>
        <path d="M0,28 Q8,22 12,14"/>
        <circle cx="0" cy="28" r="4" fill="#7C8C74" opacity="0.5"/>
      </g>
    </svg>
  );
}

// ── SageCheckbox Component ───────────────────────────────────────────────────

function SageCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <div onClick={onChange} className="lr-guest-row select-none">
      <div className={`lr-check ${checked ? 'on' : ''}`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="lr-name">{label}</span>
    </div>
  );
}

// ── Leaf Divider ─────────────────────────────────────────────────────────────

function SageDivider() {
  return (
    <div className="ld">
      <div className="ld-rule"></div>
      <svg className="ld-bloom" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g stroke="#7C8C74" strokeWidth="0.9" fill="none">
          <path d="M14,26 Q10,20 8,14 Q6,8 10,4"/>
          <path d="M14,26 Q18,20 20,14 Q22,8 18,4"/>
          <path d="M14,26 Q8,22 4,18 Q1,14 4,10"/>
          <path d="M14,26 Q20,22 24,18 Q27,14 24,10"/>
          <circle cx="14" cy="26" r="2.5" fill="#7C8C74" opacity="0.45"/>
        </g>
      </svg>
      <div className="ld-rule rev"></div>
    </div>
  );
}

// ── Main Component Template ──────────────────────────────────────────────────

export default function MetallicLilyTemplate({ event, guest, subGuestsInitial }: any) {
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        .lily-root {
          box-sizing: border-box;
          background: #FAFAF8;
          font-family: 'Jost', sans-serif;
          color: #3A3A36;
          min-height: 100vh;
        }

        /* Hero styling */
        .lh { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; position: relative; overflow: hidden; }
        .lh-lily-left { position: absolute; left: -40px; bottom: -20px; width: 340px; opacity: 0.18; transform: rotate(-15deg); pointer-events: none; }
        .lh-lily-right { position: absolute; right: -40px; top: -10px; width: 300px; opacity: 0.15; transform: rotate(165deg) scaleX(-1); pointer-events: none; }
        .lh-eyebrow { font-weight: 300; font-size: 11px; letter-spacing: 0.5em; text-transform: uppercase; color: #7C8C74; margin-bottom: 28px; }
        .lh-names { font-family: 'Playfair Display', serif; font-size: clamp(44px, 8vw, 68px); font-weight: 400; font-style: italic; color: #1C1C1A; line-height: 1.1; margin-bottom: 8px; letter-spacing: -0.01em; }
        .lh-rule-wrap { display: flex; align-items: center; gap: 16px; margin: 32px auto; max-width: 300px; width: 100%; }
        .lh-rule { flex: 1; height: 0.5px; background: #A8B5A0; }
        .lh-rule-lily { width: 20px; height: 20px; }
        .lh-date { font-weight: 300; font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase; color: #7A7A72; margin-bottom: 40px; }
        .lh-scroll { font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: #AEAEA6; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .lh-scroll-line { width: 0.5px; height: 44px; background: linear-gradient(to bottom, #A8B5A0, transparent); animation: lh-pulse 2.8s ease-in-out infinite; }
        @keyframes lh-pulse { 0%,100%{opacity:0.25}50%{opacity:0.85} }

        /* Generic Section Bounds */
        .ls { padding: 80px 24px; max-width: 680px; margin: 0 auto; text-align: center; }
        .ls-label { display: block; font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #7C8C74; margin-bottom: 20px; font-weight: 400; }
        .ls-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; color: #1C1C1A; margin-bottom: 14px; line-height: 1.25; }
        .ls-body { font-size: 16px; line-height: 1.85; color: #7A7A72; max-width: 460px; margin: 0 auto; font-weight: 300; }

        /* Card Framing Structs */
        .lf-card { border: 0.5px solid rgba(124,140,116,0.25); background: #FFFFFF; max-width: 540px; margin: 0 auto; padding: 56px 52px; text-align: center; position: relative; overflow: hidden; }
        .lf-corner { position: absolute; opacity: 0.12; }
        .lf-corner.tl { top: -10px; left: -10px; transform: rotate(0deg); width: 100px; }
        .lf-corner.br { bottom: -10px; right: -10px; transform: rotate(180deg); width: 100px; }
        .lf-intro { font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; color: #7C8C74; margin-bottom: 24px; font-weight: 300; }
        .lf-families { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; color: #1C1C1A; line-height: 1.5; margin-bottom: 20px; }
        .lf-body { font-size: 16px; line-height: 1.85; color: #3A3A36; font-weight: 300; }
        .lf-guest { font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic; color: #C9A99A; margin: 24px 0; }
        .lf-closing { font-size: 15px; color: #7A7A72; font-style: italic; font-weight: 300; line-height: 1.75; }

        /* Dividers */
        .ld { display: flex; align-items: center; gap: 20px; max-width: 320px; margin: 0 auto; padding: 36px 0; }
        .ld-rule { flex: 1; height: 0.5px; background: linear-gradient(to right, transparent, #7C8C74); }
        .ld-rule.rev { background: linear-gradient(to left, transparent, #7C8C74); }
        .ld-bloom { width: 28px; height: 28px; flex-shrink: 0; }

        /* Grid Matrices for events */
        .le-grid { display: grid; grid-template-columns: 1fr; gap: 16px; max-width: 580px; margin: 36px auto 0; }
        .le-card { background: #FFFFFF; border: 0.5px solid rgba(124,140,116,0.25); padding: 40px 24px; text-align: center; position: relative; overflow: hidden; }
        .le-card-lily { position: absolute; bottom: -12px; right: -12px; width: 70px; opacity: 0.1; transform: rotate(30deg); pointer-events: none; }
        .le-type { font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase; color: #7C8C74; margin-bottom: 16px; font-weight: 400; }
        .le-time { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; font-style: italic; color: #1C1C1A; line-height: 1.2; margin-bottom: 16px; }
        .le-sep { width: 32px; height: 0.5px; background: #A8B5A0; margin: 0 auto 16px; }
        .le-venue { font-family: 'Playfair Display', serif; font-size: 18px; color: #1C1C1A; margin-bottom: 6px; white-space: normal; word-wrap: break-word; }
        .le-loc { font-size: 13px; color: #AEAEA6; margin-bottom: 20px; font-weight: 300; }
        .le-map { display: inline-block; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #7C8C74; border: 0.5px solid rgba(124,140,116,0.25); padding: 8px 20px; cursor: pointer; background: transparent; transition: all 0.2s; font-family: 'Jost', sans-serif; font-weight: 400; }
        .le-map:hover { background: #EEF1EC; }

        /* RSVP UI Blocks */
        .lr-card { background: #FFFFFF; border: 0.5px solid rgba(124,140,116,0.25); max-width: 540px; margin: 0 auto; padding: 52px 48px; position: relative; overflow: hidden; }
        @media(max-width:520px){ .lr-card, .lf-card { padding: 40px 28px; } }
        .lr-lily-bg { position: absolute; bottom: -20px; left: -20px; width: 160px; opacity: 0.06; transform: rotate(-20deg); pointer-events: none; }
        .lr-welcome { font-family: 'Playfair Display', serif; font-size: 26px; font-style: italic; color: #1C1C1A; margin-bottom: 8px; }
        .lr-sub { font-size: 13px; color: #7A7A72; margin-bottom: 36px; letter-spacing: 0.06em; font-weight: 300; text-transform: uppercase; }
        .lr-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .lr-btn { padding: 15px; border: 0.5px solid rgba(124,140,116,0.25); background: transparent; color: #7A7A72; font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; font-weight: 400; }
        .lr-btn:hover { border-color: #7C8C74; color: #7C8C74; }
        .lr-btn-yes { background: #7C8C74 !important; border-color: #7C8C74 !important; color: #fff !important; }
        .lr-btn-no { background: #3A3A36 !important; border-color: #3A3A36 !important; color: #fff !important; }
        .lr-guest-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; text-align: left; }
        .lr-guest-row { display: flex; align-items: center; gap: 14px; padding: 13px 16px; border: 0.5px solid rgba(124,140,116,0.25); cursor: pointer; transition: border-color 0.2s; background: transparent; }
        .lr-guest-row:hover { border-color: #A8B5A0; }
        .lr-check { width: 20px; height: 20px; border: 0.5px solid #A8B5A0; border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
        .lr-check.on { background: #7C8C74; border-color: #7C8C74; }
        .lr-name { font-size: 15px; color: #3A3A36; font-weight: 300; font-family: 'Jost', sans-serif; }
        .lr-confirm { width: 100%; padding: 17px; background: #1C1C1A; border: none; color: #fff; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; font-weight: 400; }
        .lr-confirm:hover:not(:disabled) { background: #3A3A36; }
        .lr-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Animation success metrics */
        .lr-success { text-align: center; padding: 12px 0; }
        .lr-success-bloom { animation: lr-bloom 0.5s ease-out; }
        @keyframes lr-bloom { 0%{transform:scale(0.4);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        .lr-success-msg { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: #7C8C74; margin-top: 18px; }
        .lr-success-sub { font-size: 13px; color: #7A7A72; margin-top: 8px; letter-spacing: 0.05em; font-weight: 300; }

        /* Footer structuring */
        .lft { background: #1C1C1A; padding: 72px 24px 56px; text-align: center; position: relative; overflow: hidden; }
        .lft-lily-l { position: absolute; left: -30px; bottom: 0; width: 260px; opacity: 0.08; transform: rotate(10deg); pointer-events: none; }
        .lft-lily-r { position: absolute; right: -30px; top: 20px; width: 200px; opacity: 0.07; transform: rotate(-170deg) scaleX(-1); pointer-events: none; }
        .lft-mono { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 400; font-style: italic; color: rgba(168,181,160,0.6); margin-bottom: 20px; position: relative; letter-spacing: 0.05em; }
        .lft-msg { font-size: 17px; font-family: 'Playfair Display', serif; font-style: italic; color: rgba(250,250,248,0.45); max-width: 380px; margin: 0 auto; line-height: 1.75; position: relative; }
        .lft-rule { width: 40px; height: 0.5px; background: #A8B5A0; opacity: 0.4; margin: 32px auto 0; position: relative; }
      `}</style>

      <div className="lily-root">
        {/* ── HERO ── */}
        <section className="lh">
          <LilyLeft className="lh-lily-left" />
          <LilyRight className="lh-lily-right" />

          <p className="lh-eyebrow">An Invitation to Celebrate</p>
          <div className="lh-names">{event.title}</div>

          <div className="lh-rule-wrap">
            <div className="lh-rule"></div>
            <svg className="lh-rule-lily" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#7C8C74" strokeWidth="1" fill="none">
                <path d="M12,22 Q10,16 8,10 Q6,6 8,2"/>
                <path d="M12,22 Q14,16 16,10 Q18,6 16,2"/>
                <path d="M12,22 Q8,18 4,16 Q2,15 2,12"/>
                <path d="M12,22 Q16,18 20,16 Q22,15 22,12"/>
                <circle cx="12" cy="22" r="2" fill="#7C8C74" opacity="0.5"/>
              </g>
            </svg>
            <div className="lh-rule"></div>
          </div>

          <p className="lh-date">{eventDateFormatted}</p>

          <div className="lh-scroll">
            <span>Scroll</span>
            <div className="lh-scroll-line"></div>
          </div>
        </section>

        {/* ── FORMAL INVITATION ── */}
        <section className="ls">
          <span className="ls-label">You are cordially invited</span>
          <div className="lf-card">
            <svg className="lf-corner tl" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g stroke="#7C8C74" strokeWidth="1" fill="none">
                <path d="M10,110 Q30,80 50,50 Q65,25 70,0" strokeWidth="1.5"/>
                <path d="M70,0 Q58,-6 52,8 Q46,20 56,30"/>
                <path d="M70,0 Q80,-4 82,10 Q82,22 72,28"/>
                <path d="M70,0 Q76,8 86,12 Q96,16 96,28"/>
                <path d="M70,0 Q62,10 54,16 Q46,22 46,34"/>
                <circle cx="70" cy="0" r="4" fill="#7C8C74" opacity="0.5"/>
                <path d="M40,70 Q20,60 12,68 Q8,74 14,82 Q28,86 40,70Z" fill="#7C8C74" opacity="0.15"/>
              </g>
            </svg>
            <svg className="lf-corner br" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g stroke="#7C8C74" strokeWidth="1" fill="none">
                <path d="M10,110 Q30,80 50,50 Q65,25 70,0" strokeWidth="1.5"/>
                <path d="M70,0 Q58,-6 52,8 Q46,20 56,30"/>
                <path d="M70,0 Q80,-4 82,10 Q82,22 72,28"/>
                <circle cx="70" cy="0" r="4" fill="#7C8C74" opacity="0.5"/>
              </g>
            </svg>

            <p className="lf-intro">Together with their families</p>
            <div className="lf-families">{event.title}</div>
            <p className="lf-body">joyfully request the honour of your presence<br />at the celebration of their marriage</p>
            <div className="lf-guest">Dear {guest.first_name},</div>
            <p className="lf-closing">
              It would be our greatest joy to have you<br />
              witness the beginning of our forever.
            </p>
          </div>
        </section>

        <SageDivider />

        {/* ── EVENT DETAILS ── */}
        <section className="ls" style={{ paddingTop: 0 }}>
          <span className="ls-label">Celebrations</span>
          <h2 className="ls-title">The Details</h2>
          <div className="le-grid">
            <div className="le-card max-w-sm mx-auto w-full">
              <LilyCardCorner />
              <p className="le-type">Wedding Ceremony & Reception</p>
              <div className="le-time">
                {new Date(event.event_date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div className="le-sep"></div>
              <p className="le-venue">{event.location}</p>
              <p className="le-loc">Honored Guest Invitation</p>
              <button 
                className="le-map" 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(event.location)}`, '_blank')}
              >
                View on Map
              </button>
            </div>
          </div>
        </section>

        <SageDivider />

        {/* ── RSVP SECTION ── */}
        <section className="ls" style={{ paddingTop: 0, paddingBottom: 80 }}>
          <span className="ls-label">Kindly Reply By</span>
          <h2 className="ls-title">Will You Join Us?</h2>
          <p className="ls-body" style={{ marginBottom: 40 }}>
            Please let us know your response below so we may meticulously arrange accommodations for your party.
          </p>

          <div className="lr-card">
            <LilyWatermark />

            <p className="lr-welcome">Welcome, {guest.first_name}</p>
            <p className="lr-sub">Please indicate your attendance</p>

            <div className="lr-btns">
              <button 
                className={`lr-btn ${rsvpStatus === 'confirmed' ? 'lr-btn-yes' : ''}`} 
                onClick={() => handleSetRsvp('confirmed')}
              >
                Joyfully Accept
              </button>
              <button 
                className={`lr-btn ${rsvpStatus === 'declined' ? 'lr-btn-no' : ''}`} 
                onClick={() => handleSetRsvp('declined')}
              >
                Regretfully Decline
              </button>
            </div>

            {/* Sub-Guest Selection List */}
            {rsvpStatus === 'confirmed' && (
              <div className="lr-guest-list">
                <SageCheckbox 
                  checked={primaryAttending}
                  label={`${guest.first_name} (Primary Contact)`}
                  onChange={() => setPrimaryAttending(v => !v)}
                />
                {subGuests.map((sg: any) => (
                  <SageCheckbox 
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

            {/* Interaction Fire Action Area */}
            {!submitted && rsvpStatus !== 'pending' && (
              <button 
                className="lr-confirm" 
                onClick={submitRSVP}
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Confirm Response'}
              </button>
            )}

            {/* Success Execution Frame */}
            {submitted && (
              <div className="lr-success">
                <div className="lr-success-bloom">
                  <LilySuccess />
                </div>
                <p className="lr-success-msg">We are delighted you can join us</p>
                <p className="lr-success-sub">Your response has been beautifully recorded</p>
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lft">
          <LilyLeft className="lft-lily-l" />
          <LilyRight className="lft-lily-r" />
          <div className="lft-mono">{generateMonogram(event.title)}</div>
          <p className="lft-msg">Thank you for being part of our story.<br />We cannot wait to celebrate with you.</p>
          <div className="lft-rule"></div>
        </footer>
      </div>
    </>
  );
}