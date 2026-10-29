'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Mic, Square } from 'lucide-react';
import { useVoiceRecorder } from '@/lib/media/recorder';
import { useExtractAnswerAudio } from '../queries';
import type { ExtractResult } from '../types';

const toBanglaDigits = (value: number) =>
  String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

type Props = {
  questionKey: string;
  onResult: (result: ExtractResult) => void;
  onError: () => void;
};

export default function VoiceAnswerInput({ questionKey, onResult, onError }: Props) {
  const { status, seconds, blob, mimeType, error, start, stop, reset } = useVoiceRecorder();
  const extract = useExtractAnswerAudio();
  const isAnalyzing = extract.isPending;

  // When a recording finishes, send it to the backend automatically.
const mutateRef = useRef(extract.mutate);
useEffect(() => { mutateRef.current = extract.mutate; });

useEffect(() => {
  if (status === 'recorded' && blob && mimeType) {
    mutateRef.current(
      { questionKey, blob, mimeType },
      {
        onSuccess: (result) => onResult(result),
        onError: () => {
          reset();
          onError();
        },
      },
    );
  }
}, [status, blob, mimeType, questionKey, onResult, onError, reset]);
  const progress = Math.min(Math.max(seconds, 0), 15) / 15 * 100;

  if (status === 'recording') {
    return (
      <div className="flex w-full flex-col items-center gap-5 text-center">
        <button
          type="button"
          onClick={stop}
          aria-label="বলা শেষ করুন"
          className="flex size-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 transition-transform hover:scale-105 active:scale-95"
        >
          <Square className="size-9 animate-pulse fill-current" aria-hidden="true" />
        </button>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[#103963]">{toBanglaDigits(seconds)} সেকেন্ড</p>
          <p className="text-sm text-slate-500">বলা শেষ হলে চাপুন</p>
        </div>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-red-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (status === 'recorded') {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <LoaderCircle className="size-12 animate-spin text-[#103963]" />
          <p className="text-base font-medium text-[#103963]">শুনছি...</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-12 text-green-500" />
        <p className="text-base font-medium text-[#103963]">রেকর্ড হয়েছে</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-[#103963]"
        >
          আবার বলুন
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="size-12 text-orange-500" />
        <p className="max-w-xs text-sm text-red-700">{error ?? 'কিছু একটা সমস্যা হয়েছে'}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-[#103963]"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={() => void start()}
        aria-label="কথা বলুন"
        className="flex size-24 items-center justify-center rounded-full bg-[#103963] text-white shadow-lg shadow-[#103963]/20 transition-transform hover:scale-105 active:scale-95"
      >
        <Mic className="size-10" />
      </button>
      <p className="text-base font-medium text-[#103963]">কথা বলুন</p>
    </div>
  );
}