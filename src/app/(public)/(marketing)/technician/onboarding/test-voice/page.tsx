'use client';

import VoiceAnswerInput from '@/features/technician/components/voice-answer-input';
import type { ExtractResult } from '@/features/technician/types';

export default function TestVoicePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <p className="mb-6 text-center text-sm text-slate-500">
          questionKey: <strong>age</strong>
        </p>
        <VoiceAnswerInput
          questionKey="age"
          onResult={(r: ExtractResult) => alert(JSON.stringify(r, null, 2))}
          onError={() => alert('বুঝতে পারিনি। নিচের থেকে একটি বেছে নিন।')}
        />
      </section>
    </main>
  );
}