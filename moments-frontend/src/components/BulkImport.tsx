'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Upload, X, CheckCircle2, AlertCircle, 
  Loader2, FileSpreadsheet, Info 
} from 'lucide-react';

interface BulkImportProps {
  eventId: string;
  onSuccess: () => void;
}

export default function BulkImport({ eventId, onSuccess }: BulkImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const startIdx = rows[0].toLowerCase().includes('name') ? 1 : 0;
        const dataRows = rows.slice(startIdx);

        let currentPrimaryGuestId: string | null = null;

        for (const row of dataRows) {
          const [name, phone] = row.split(',').map(cell => cell.trim());
          if (!name) continue;

          if (phone) {
            // This is a PRIMARY GUEST (has a phone number)
            const { data: primaryGuest, error: pError } = await supabase
              .from('guests')
              .insert([{
                event_id: eventId,
                first_name: name,
                phone: phone,
                invitation_sent: false,
                is_attending: false,
                rsvp_status: 'pending'
              }])
              .select()
              .single();

            if (pError) throw pError;
            currentPrimaryGuestId = primaryGuest.id;
          } else if (currentPrimaryGuestId) {
            // This is a SUB-GUEST (no phone, belongs to previous primary)
            const { error: sError } = await supabase
              .from('sub_guests')
              .insert([{
                parent_guest_id: currentPrimaryGuestId,
                full_name: name,
                is_attending: false
              }]);

            if (sError) throw sError;
          }
        }

        onSuccess();
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to process import");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-sm"
      >
        <Upload className="w-3.5 h-3.5" /> Bulk Import
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-10 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X /></button>
            
            <h3 className="text-xl font-bold text-white mb-2 italic tracking-tight uppercase">Family Import</h3>
            <p className="text-[10px] text-zinc-500 mb-8 uppercase tracking-[0.2em]">Primary guest must have a phone number.</p>

            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isUploading ? 'opacity-50' : 'hover:border-zinc-500 hover:bg-zinc-950/50'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              {isUploading ? <Loader2 className="w-10 h-10 text-zinc-500 animate-spin" /> : <FileSpreadsheet className="w-10 h-10 text-zinc-700" />}
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">
                {isUploading ? "Linking Families..." : "Upload CSV"}
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-bold">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-800 flex gap-4">
                <Info className="w-5 h-5 text-zinc-700 shrink-0" />
                <p className="text-[9px] text-zinc-600 leading-relaxed uppercase tracking-tighter">
                  <span className="text-zinc-400">Logic:</span> Rows with phone numbers are treated as Primary Guests. Rows <span className="italic">without</span> phone numbers are added as family members to the last primary guest found above them.
                </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}