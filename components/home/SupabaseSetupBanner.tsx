import React from 'react';

export function SupabaseSetupBanner() {
  return (
    <div className="my-8 p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-amber-900 dark:text-amber-200 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
          <span className="material-icons text-2xl">database</span>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-base">Supabase Database Connection Required</h3>
          <p className="text-sm opacity-90">
            Please configure your Supabase environment variables in{' '}
            <code className="px-2 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 rounded font-mono text-xs">
              .env.local
            </code>{' '}
            to load live properties from the database:
          </p>
          <div className="bg-black/5 dark:bg-black/40 rounded-xl p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
          </div>
          <p className="text-xs opacity-75">
            After configuring <code className="font-mono">.env.local</code>, run{' '}
            <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded">npm run db:seed</code>{' '}
            to populate initial properties.
          </p>
        </div>
      </div>
    </div>
  );
}
