import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Fetch events from Supabase
  const { data: events, error } = await supabase.from('events').select('*')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Moments by Studio Click.ed</h1>
      
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl mb-4">Database Connection Test:</h2>
        <pre className="text-sm text-green-400">
          {JSON.stringify(events, null, 2)}
        </pre>
        {error && <p className="text-red-500">Error: {error.message}</p>}
      </div>
    </main>
  )
}