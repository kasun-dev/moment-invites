'use client';

import { useState } from 'react';
import { MessageSquare, X, ChevronRight, Check } from 'lucide-react';

export default function BulkMessenger({ selectedGuests, event, onClose }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentIds, setSentIds] = useState<string[]>([]);

  const currentGuest = selectedGuests[currentIndex];
  
  const generateLink = (guest: any) => {
    const message = `Hello ${guest.first_name}! 👋 %0a%0aWe are happy to invite you to *${event.title}*. %0a%0aPlease view your formal invitation and RSVP here: %0a${window.location.origin}/v/${event.slug}?guest=${guest.access_token}`;
    const cleanPhone = guest.phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handleNext = () => {
    if (currentIndex < selectedGuests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const markAsSentAndOpen = () => {
    setSentIds([...sentIds, currentGuest.id]);
    window.open(generateLink(currentGuest), '_blank');
    if (currentIndex < selectedGuests.length - 1) {
       setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Bulk Invite Sender</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              Guest {currentIndex + 1} of {selectedGuests.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500"><X /></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / selectedGuests.length) * 100}%` }}
          />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Current Recipient</p>
          <p className="text-2xl font-light text-white">{currentGuest?.first_name}</p>
          <p className="text-sm text-zinc-400 font-mono mt-1">{currentGuest?.phone}</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={markAsSentAndOpen}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" /> Open WhatsApp & Next
          </button>
          
          <button 
            onClick={handleNext}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            Skip this Guest <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Check className="w-4 h-4 text-green-500" />
                <span>{sentIds.length} Sent</span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono italic">Close this window when finished</p>
        </div>
      </div>
    </div>
  );
}