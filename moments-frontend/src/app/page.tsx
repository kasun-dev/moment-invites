'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, MessageCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

// ── Inline SVG Decorative Elements ───────────────────────────────────────────

function HeroMandala() {
  return (
    <div className="absolute right-[-50%] sm:right-[-30%] lg:right-[-20%] top-[-5%] sm:top-[-10%] w-[150vw] sm:w-[800px] h-[150vw] sm:h-[800px] opacity-[0.12] lg:opacity-[0.15] pointer-events-none animate-slow-spin">
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
        <g stroke="#B8905B" strokeWidth="1.5">
          <circle cx="400" cy="400" r="300" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="200" />
          <circle cx="400" cy="400" r="100" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 400 400)`}>
              <path d="M400,100 C450,150 480,250 400,300 C320,250 350,150 400,100 Z" />
              <line x1="400" y1="0" x2="400" y2="100" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function ContactMandala() {
  return (
    <div className="absolute left-[-40%] sm:left-[-20%] lg:left-[-15%] top-[5%] sm:top-[10%] w-[120vw] sm:w-[600px] h-[120vw] sm:h-[600px] opacity-[0.06] lg:opacity-[0.08] pointer-events-none animate-slow-spin-reverse">
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
        <g stroke="#B8905B" strokeWidth="2">
          <circle cx="400" cy="400" r="250" strokeDasharray="6 12" />
          <circle cx="400" cy="400" r="150" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 400 400)`}>
              <path d="M400,150 C460,200 480,300 400,350 C320,300 340,200 400,150 Z" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function StorefrontPage() {
  const router = useRouter();
  
  const [guestCount, setGuestCount] = useState<number>(150);
  const estimatedPrice = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(guestCount * 225);

  const [formData, setFormData] = useState({ name: '', date: '', guests: 150 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Syncs the slider and the contact form guest count automatically
  const handleGuestChange = (value: number) => {
    setGuestCount(value);
    setFormData(prev => ({ ...prev, guests: value }));
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await supabase.from('events').insert([{
      title: formData.name || 'New Consultation',
      estimated_guests: formData.guests,
      event_date: formData.date ? new Date(formData.date).toISOString() : null,
      status: 'lead',
      slug: `lead-${Date.now()}`,
      template_id: 'classic'
    }]);

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        
        .font-serif-playfair { font-family: 'Playfair Display', serif; }
        .font-sans-jost { font-family: 'Jost', sans-serif; }
        
        .bg-dark { background-color: #121110; }
        .bg-card-dark { background-color: #1A1918; }
        .bg-light { background-color: #F9F8F6; }
        .text-gold { color: #B8905B; }
        .border-gold { border-color: #B8905B; }
        .bg-gold { background-color: #B8905B; }

        /* Custom Slider Knob */
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: #B8905B;
          border-radius: 50%;
          border: 3px solid #1A1918;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .slider-custom::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-custom::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background-color: #B8905B;
          border-radius: 50%;
          border: 3px solid #1A1918;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .slider-custom::-moz-range-thumb:hover {
          transform: scale(1.15);
        }

        /* Animation Keyframes */
        .animate-fade-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }

        .animate-slow-spin {
          animation: slowSpin 90s linear infinite;
        }
        .animate-slow-spin-reverse {
          animation: slowSpin 120s linear infinite reverse;
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="font-sans-jost w-full max-w-[100vw] overflow-hidden bg-dark">
        
        {/* ── NAVIGATION ── */}
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 lg:px-16 py-4 md:py-6 text-white bg-[#121110]/50 backdrop-blur-lg border-b border-white/10 animate-fade-up">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 border border-white/20 flex items-center justify-center font-serif-playfair italic text-lg md:text-xl">M</div>
            <div className="flex flex-col">
              <span className="font-serif-playfair text-lg md:text-xl leading-none">Moments</span>
              <span className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] text-white/60 mt-1">By Studio Click.ed</span>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8 text-[9px] md:text-[11px] uppercase tracking-[0.2em]">
            <button onClick={() => scrollToSection('contact')} className="border border-gold text-gold px-4 md:px-6 py-2 md:py-2.5 hover:bg-gold hover:text-[#121110] transition-colors">Enquire</button>
          </div>
        </nav>

        {/* ── HERO SECTION ── */}
        <section className="bg-dark text-white min-h-[100svh] w-full relative flex flex-col justify-between px-6 md:px-12 lg:px-16 pt-28 pb-8 overflow-hidden">
          <HeroMandala />
          
          <div className="max-w-4xl relative z-10 my-auto pt-8">
            <p className="animate-fade-up text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gold mb-4 md:mb-6 font-medium">
              Digital Invitations, Beautifully Considered
            </p>
            <h1 className="animate-fade-up delay-100 font-serif-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-5 md:mb-6">
              Your celebration,<br />
              <span className="text-gold italic">thoughtfully told.</span>
            </h1>
            <p className="animate-fade-up delay-200 text-sm sm:text-base md:text-lg lg:text-xl text-white/70 max-w-2xl font-light leading-relaxed mb-8 md:mb-10">
              Couture digital invitations and effortless guest management for Sri Lanka's most meaningful celebrations.
            </p>
            
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <button onClick={() => scrollToSection('collection')} className="w-full sm:w-auto bg-gold text-[#121110] px-8 py-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-3 hover:bg-[#c9a473] transition-colors">
                Explore Designs <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollToSection('pricing')} className="w-full sm:w-auto border border-white/20 px-8 py-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium hover:border-white/50 transition-colors text-center">
                Calculate Price
              </button>
            </div>
          </div>

          <div className="animate-fade-up delay-400 mt-auto pt-10 md:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-0 border-t border-white/10 relative z-10 w-full">
            <div className="flex flex-col gap-2 md:pr-8">
              <Calendar className="w-5 h-5 text-gold" />
              <h3 className="font-serif-playfair text-lg md:text-xl">Multi-day ready</h3>
              <p className="text-xs md:text-sm text-white/50 font-light">One invitation for every ceremony.</p>
            </div>
            <div className="flex flex-col gap-2 sm:border-l border-white/10 sm:px-8">
              <Users className="w-5 h-5 text-gold" />
              <h3 className="font-serif-playfair text-lg md:text-xl">Household RSVP</h3>
              <p className="text-xs md:text-sm text-white/50 font-light">Every guest, beautifully accounted for.</p>
            </div>
            <div className="flex flex-col gap-2 sm:border-l border-white/10 sm:pl-8">
              <MessageCircle className="w-5 h-5 text-gold" />
              <h3 className="font-serif-playfair text-lg md:text-xl">WhatsApp delivery</h3>
              <p className="text-xs md:text-sm text-white/50 font-light">Personal invitations, sent with ease.</p>
            </div>
          </div>
        </section>

        {/* ── INVITATION COLLECTION ── */}
        <section id="collection" className="bg-light py-20 lg:py-32 px-6 md:px-12 lg:px-16 text-[#121110]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12 lg:mb-16">
              <div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-medium">The Invitation Collection</p>
                <h2 className="font-serif-playfair text-4xl lg:text-5xl">Three distinct expressions</h2>
              </div>
              <span className="text-[10px] md:text-xs text-[#121110]/50 tracking-widest hidden sm:block">01 — 03</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
              {/* Classic Dark */}
              <div className="flex flex-col gap-4 lg:gap-6 group">
                <div className="bg-[#121110] aspect-[3/4] p-6 lg:p-8 flex flex-col justify-between items-center text-center text-white relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] shadow-lg">
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] opacity-60">Studio Click.ed Presents</span>
                  <div className="relative z-10 w-full">
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 lg:w-48 lg:h-48 opacity-20 transition-transform duration-700 group-hover:rotate-45" viewBox="0 0 100 100" fill="none" stroke="currentColor"><circle cx="50" cy="50" r="40"/><path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22"/></svg>
                    <p className="font-serif-playfair italic text-xs lg:text-sm text-white/80 mb-3 lg:mb-4">Together with their families</p>
                    <h3 className="font-serif-playfair text-3xl lg:text-4xl mb-3 lg:mb-4">A <span className="text-gold italic">&amp;</span> D</h3>
                    <p className="text-[8px] lg:text-[10px] tracking-[0.3em] text-white/60">28 • 11 • 2026</p>
                  </div>
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] opacity-60">Kandy, Sri Lanka</span>
                </div>
                <div>
                  <span className="text-[9px] lg:text-[10px] text-gold tracking-widest">01</span>
                  <h3 className="font-serif-playfair text-xl lg:text-2xl mt-1 mb-2">Classic Dark</h3>
                  <p className="text-xs lg:text-sm text-[#121110]/60 font-light">Black tie, candlelight and timeless restraint.</p>
                </div>
              </div>

              {/* Soft Lily */}
              <div className="flex flex-col gap-4 lg:gap-6 group">
                <div className="bg-[#F4F1EB] border border-black/5 aspect-[3/4] p-6 lg:p-8 flex flex-col justify-between items-center text-center text-[#121110] relative overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] opacity-40">Studio Click.ed Presents</span>
                  <div className="relative z-10 w-full">
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 lg:w-48 lg:h-48 opacity-10 transition-transform duration-700 group-hover:-rotate-45" viewBox="0 0 100 100" fill="none" stroke="currentColor"><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="45" strokeDasharray="2 4"/><path d="M50 5 L50 95 M5 50 L95 50"/></svg>
                    <p className="font-serif-playfair italic text-xs lg:text-sm text-[#121110]/70 mb-3 lg:mb-4">Together with their families</p>
                    <h3 className="font-serif-playfair text-3xl lg:text-4xl mb-3 lg:mb-4">A <span className="text-gold italic">&amp;</span> D</h3>
                    <p className="text-[8px] lg:text-[10px] tracking-[0.3em] text-[#121110]/50">28 • 11 • 2026</p>
                  </div>
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] opacity-40">Kandy, Sri Lanka</span>
                </div>
                <div>
                  <span className="text-[9px] lg:text-[10px] text-gold tracking-widest">02</span>
                  <h3 className="font-serif-playfair text-xl lg:text-2xl mt-1 mb-2">Soft Lily</h3>
                  <p className="text-xs lg:text-sm text-[#121110]/60 font-light">Ivory paper, quiet florals and graceful warmth.</p>
                </div>
              </div>

              {/* Royal Kandyan */}
              <div className="flex flex-col gap-4 lg:gap-6 group md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none">
                <div className="bg-[#3A1B0E] aspect-[3/4] md:aspect-auto lg:aspect-[3/4] md:h-full p-6 lg:p-8 flex flex-col justify-between items-center text-center text-[#F9F8F6] relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] shadow-lg">
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/60">Studio Click.ed Presents</span>
                  <div className="relative z-10 w-full my-auto py-12 lg:py-0">
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 lg:w-56 lg:h-56 opacity-20 transition-transform duration-700 group-hover:rotate-45" viewBox="0 0 100 100" fill="none" stroke="#D4AF37"><circle cx="50" cy="50" r="35"/><path d="M50 15 C60 30 70 50 50 85 C30 50 40 30 50 15 Z"/></svg>
                    <p className="font-serif-playfair italic text-xs lg:text-sm text-[#F9F8F6]/80 mb-3 lg:mb-4">Together with their families</p>
                    <h3 className="font-serif-playfair text-3xl lg:text-4xl mb-3 lg:mb-4 text-[#D4AF37]">A <span className="italic opacity-80">&amp;</span> D</h3>
                    <p className="text-[8px] lg:text-[10px] tracking-[0.3em] text-[#D4AF37]/70">28 • 11 • 2026</p>
                  </div>
                  <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/60">Kandy, Sri Lanka</span>
                </div>
                <div>
                  <span className="text-[9px] lg:text-[10px] text-gold tracking-widest">03</span>
                  <h3 className="font-serif-playfair text-xl lg:text-2xl mt-1 mb-2">Royal Kandyan Heritage</h3>
                  <p className="text-xs lg:text-sm text-[#121110]/60 font-light">Ceremonial detail interpreted with modern elegance.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING CALCULATOR ── */}
        <section id="pricing" className="bg-dark py-20 lg:py-32 px-6 md:px-12 lg:px-16 text-white border-t border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold mb-4 md:mb-6 font-medium">Transparent Pricing</p>
              <h2 className="font-serif-playfair text-4xl lg:text-5xl leading-[1.1] mb-6 md:mb-8">
                One celebration.<br />No surprises.
              </h2>
              <p className="text-sm md:text-base text-white/60 font-light leading-relaxed max-w-md">
                Your complete invitation experience includes design, guest import, household RSVPs and WhatsApp-ready links.
              </p>
            </div>

            <div className="bg-card-dark border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">Invited Guests</span>
                <span className="font-serif-playfair text-3xl md:text-4xl text-gold">{guestCount}</span>
              </div>
              
              <input 
                type="range" min="50" max="500" step="10" 
                value={guestCount}
                onChange={(e) => handleGuestChange(Number(e.target.value))}
                className="slider-custom w-full h-1.5 rounded-none appearance-none mb-4 bg-white/20"
                style={{ background: `linear-gradient(to right, #B8905B ${((guestCount - 50) / 450) * 100}%, rgba(255,255,255,0.2) ${((guestCount - 50) / 450) * 100}%)` }}
              />
              
              <div className="flex justify-between text-[9px] md:text-[10px] text-white/40 mb-12 md:mb-16">
                <span>50</span>
                <span>500</span>
              </div>

              <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
                <div>
                  <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1 md:mb-2">Estimated Investment</span>
                  <span className="text-[10px] md:text-xs text-white/40 font-light">All essentials included</span>
                </div>
                <div className="sm:text-right">
                  <span className="font-serif-playfair text-3xl md:text-4xl text-gold">{estimatedPrice}</span>
                  <span className="block text-[9px] md:text-[10px] text-white/40 mt-1 md:mt-2">starting from</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LEAD CAPTURE FORM ── */}
        <section id="contact" className="bg-light py-20 lg:py-32 px-6 md:px-12 lg:px-16 text-[#121110] relative overflow-hidden">
          <ContactMandala />
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative z-10 items-center">
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold mb-4 md:mb-6 font-medium">Begin Your Story</p>
              <h2 className="font-serif-playfair text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 md:mb-8">
                Let's create<br />something<br />unforgettable.
              </h2>
              <p className="text-sm md:text-base text-[#121110]/60 font-light leading-relaxed max-w-sm">
                Tell us a little about your celebration. We'll be in touch with a considered recommendation.
              </p>
            </div>

            <div>
              {isSubmitted ? (
                <div className="bg-white p-8 sm:p-12 border border-black/5 text-center flex flex-col items-center shadow-lg animate-fade-up">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-gold mb-4 sm:mb-6" />
                  <h3 className="font-serif-playfair text-2xl sm:text-3xl mb-3 sm:mb-4">Request Received</h3>
                  <p className="text-sm sm:text-base text-[#121110]/60 font-light">We will be in touch shortly to begin curating your digital experience.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="flex flex-col gap-6 sm:gap-8 bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-sm border border-black/5">
                  <div className="border-b border-black/10 pb-2">
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#121110]/60 mb-2">Your Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Amaya Perera"
                      className="w-full bg-transparent outline-none text-lg md:text-xl font-light placeholder:text-black/20"
                    />
                  </div>
                  
                  <div className="border-b border-black/10 pb-2">
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#121110]/60 mb-2">Celebration Date</label>
                    <input 
                      type="date" required
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-transparent outline-none text-lg md:text-xl font-light text-[#121110]"
                    />
                  </div>

                  <div className="border-b border-black/10 pb-2 mb-2 sm:mb-4">
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#121110]/60 mb-2">Estimated Guests</label>
                    <input 
                      type="number" required min="10"
                      value={formData.guests} onChange={e => handleGuestChange(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-lg md:text-xl font-light"
                    />
                  </div>

                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-[#B8905B] text-[#121110] py-4 sm:py-5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#a67e49] transition-colors flex justify-center items-center gap-3 shadow-md"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request A Consultation'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-light border-t border-black/10 py-8 px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 text-[#121110] text-center md:text-left">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 border border-black/20 flex items-center justify-center font-serif-playfair italic text-lg">M</div>
            <div className="flex flex-col items-start">
              <span className="font-serif-playfair text-lg leading-none">Moments</span>
              <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-[#121110]/50 mt-1">By Studio Click.ed</span>
            </div>
          </div>
          
          <p className="text-[9px] md:text-[10px] text-[#121110]/50 max-w-[200px] md:max-w-none">Designed for distinction in Colombo, Sri Lanka.</p>
          
          <p className="text-[9px] md:text-[10px] text-[#121110]/80 tracking-widest">hello@studioclicked.lk</p>
        </footer>

      </div>
    </>
  );
}