'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TemplateComponents } from '@/components/templates/registry';
import { Loader2, XCircle } from 'lucide-react';

export default function GuestInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const guestToken = searchParams.get('guest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!guestToken) { setError("Invalid link."); setLoading(false); return; }

      const { data: inv, error: fetchError } = await supabase
        .from('guests')
        .select(`*, events!inner(*), sub_guests(*)`)
        .eq('access_token', guestToken)
        .eq('events.slug', slug)
        .single();

      if (fetchError || !inv) {
        setError("Invitation not found.");
      } else {
        setData(inv);
      }
      setLoading(false);
    };
    fetchInvitation();
  }, [slug, guestToken]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  if (error || !data) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center text-zinc-500"><XCircle className="mr-2" /> {error}</div>;

  // DYNAMIC COMPONENT RESOLUTION
  const Template = TemplateComponents[data.events.template_id] || TemplateComponents['classic'];

  return (
    <Template 
      event={data.events} 
      guest={data} 
      subGuestsInitial={data.sub_guests} 
    />
  );
}