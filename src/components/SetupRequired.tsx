'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function SetupRequired({
  title = 'Setup Required',
  steps = [
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.',
    'Run: supabase link --project-ref <your-project-ref>',
    'Run: supabase db push (or supabase migration up) to create required functions/tables.'
  ],
  note
}: {
  title?: string;
  steps?: string[];
  note?: string;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <CardTitle className="text-amber-800 dark:text-amber-200">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ol className="list-decimal pl-5 space-y-1">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {note && <p className="text-xs opacity-80">{note}</p>}
      </CardContent>
    </Card>
  );
}

