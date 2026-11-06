import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'recorded' | 'error';

export type UseVoiceRecorderResult = {
  status: RecorderStatus;
  seconds: number;
  blob: Blob | null;
  mimeType: string | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

const MAX_SECONDS = 15;
const MAX_BYTES = 1_048_576; // 1 MB

// Pick the best supported audio format. Chrome/Android → webm, Safari → mp4.
function pickMimeType(): string | null {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up the timer and the stream tracks.
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  // Stop cleanly when the component unmounts.
  useEffect(() => () => cleanup(), [cleanup]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  const start = useCallback(async () => {
    setStatus('idle');
    setSeconds(0);
    setBlob(null);
    setError(null);
    chunksRef.current = [];

    const type = pickMimeType();
    if (!type) {
      setError('এই ব্রাউজারে রেকর্ডিং সমর্থিত নয়।');
      setStatus('error');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('মাইক্রোফোনের অনুমতি দিন, তারপর আবার চেষ্টা করুন।');
      setStatus('error');
      return;
    }

    streamRef.current = stream;
    const recorder = new MediaRecorder(stream, { mimeType: type });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      cleanup();
      const recorded = new Blob(chunksRef.current, { type });
      if (recorded.size > MAX_BYTES) {
        setError('রেকর্ডিংটি অনেক বড় হয়ে গেছে। আবার চেষ্টা করুন।');
        setStatus('error');
        return;
      }
      setBlob(recorded);
      setMimeType(type);
      setStatus('recorded');
    };

    recorder.start(250); // collect chunks every 250 ms
    setStatus('recording');

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) {
        recorder.stop();
      }
    }, 1_000);
  }, [cleanup]);

  const reset = useCallback(() => {
    stop();
    setStatus('idle');
    setSeconds(0);
    setBlob(null);
    setMimeType(null);
    setError(null);
  }, [stop]);

  return { status, seconds, blob, mimeType, error, start, stop, reset };
}