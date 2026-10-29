
'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleHelp,
  Droplets,
  HardHat,
  Home as HomeIcon,
  LoaderCircle,
  Mic2,
  Pencil,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import VoiceAnswerInput from '../components/voice-answer-input';
import { useExtractAnswerText } from '../queries';
import type { ExtractResult } from '../types';

type QuestionKey = 'age' | 'experience' | 'skills' | 'areas' | 'charge';

type SkillOption = {
  slug: string;
  label: string;
  icon: typeof Zap;
};

const questions: {
  key: QuestionKey;
  question: string;
}[] = [
  { key: 'age', question: 'আপনার বয়স কত?' },
  { key: 'experience', question: 'কত বছর ধরে কাজ করছেন?' },
  { key: 'skills', question: 'আপনি কী কাজ করেন?' },
  {
    key: 'areas',
    question: 'কোন কোন এলাকায় কাজ করতে পারবেন?',
  },
  { key: 'charge', question: 'সাধারণত কত টাকা নেন?' },
];

// Temporary UI options. We'll connect these to the real
// /meta/options endpoint before completing profile saving.
const skills: SkillOption[] = [
  { slug: 'electrician', label: 'ইলেকট্রিশিয়ান', icon: Zap },
  { slug: 'plumber', label: 'প্লাম্বার', icon: Droplets },
  { slug: 'ac', label: 'এসি মিস্ত্রি', icon: HomeIcon },
  { slug: 'carpenter', label: 'কাঠমিস্ত্রি', icon: Wrench },
  { slug: 'painter', label: 'রং মিস্ত্রি', icon: Sparkles },
  { slug: 'welder', label: 'ওয়েল্ডার', icon: HardHat },
];

const areas = [
  { slug: 'mirpur', label: 'মিরপুর' },
  { slug: 'dhanmondi', label: 'ধানমন্ডি' },
  { slug: 'uttara', label: 'উত্তরা' },
  { slug: 'mohammadpur', label: 'মোহাম্মদপুর' },
  { slug: 'banani', label: 'বনানী' },
  { slug: 'gulshan', label: 'গুলশান' },
  { slug: 'badda', label: 'বাড্ডা' },
  { slug: 'jatrabari', label: 'যাত্রাবাড়ী' },
];

const bn = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

function optionLabels(values: string[], options: { slug: string; label: string }[]) {
  const labels = values
    .map((value) => options.find((option) => option.slug === value)?.label)
    .filter((label): label is string => Boolean(label));

  return labels.join('، ') || (values.length ? `${bn(values.length)}টি নির্বাচন` : '—');
}

function resultLabel(result: ExtractResult): string {
  const value = result.value;

  if (value === null) return 'নিচের থেকে একটি বেছে নিন';

  if (typeof value === 'number') {
    return `${bn(value)} ${result.questionKey === 'age' ? 'বছর' : 'বছর'}`;
  }

  if (Array.isArray(value)) {
    const options = result.questionKey === 'skills' ? skills : areas;
    return optionLabels(value, options);
  }

  if (
    typeof value === 'object' &&
    'rateMin' in value &&
    'rateMax' in value
  ) {
    return `৳${bn(value.rateMin)} – ৳${bn(value.rateMax)}`;
  }

  return 'নিচের থেকে বেছে নিন';
}

export default function TechnicianOnboardingPage() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number | null>(null);
  const [experience, setExperience] = useState<number | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [minCharge, setMinCharge] = useState('');
  const [maxCharge, setMaxCharge] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [pendingResult, setPendingResult] = useState<ExtractResult | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [recorderVersion, setRecorderVersion] = useState(0);

  const extractText = useExtractAnswerText();
  const currentQuestion = questions[step - 1];

  const filteredAreas = useMemo(
    () =>
      areas.filter((area) =>
        area.label.toLowerCase().includes(areaSearch.trim().toLowerCase()),
      ),
    [areaSearch],
  );

  const clearAnswerState = () => {
    setPendingResult(null);
    setAnswerError(null);
    setTypedAnswer('');
    setRecorderVersion((version) => version + 1);
  };

  const handleVoiceResult = useCallback((result: ExtractResult) => {
    setPendingResult(result);
    setAnswerError(null);
  }, []);

  const handleVoiceError = useCallback(() => {
    setAnswerError('বুঝতে পারিনি। নিচের থেকে একটি বেছে নিন।');
  }, []);

  const playQuestion = () => {
    const audio = new Audio(`/audio/q-${currentQuestion.key}.mp3`);

    void audio.play().catch(() => {
      setAnswerError('প্রশ্নের অডিও চালানো যাচ্ছে না। নিচের থেকে উত্তর বেছে নিন।');
    });
  };

  const applyResult = () => {
    if (!pendingResult || pendingResult.value === null) {
      setPendingResult(null);
      setAnswerError('নিচের থেকে একটি উত্তর বেছে নিন।');
      setRecorderVersion((version) => version + 1);
      return;
    }

    const { questionKey, value } = pendingResult;

    switch (questionKey) {
      case 'age':
        if (typeof value === 'number') setAge(value);
        break;

      case 'experience':
        if (typeof value === 'number') setExperience(value);
        break;

      case 'skills':
        if (Array.isArray(value)) setSelectedSkills(value);
        break;

      case 'areas':
        if (Array.isArray(value)) setSelectedAreas(value);
        break;

      case 'charge':
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          'rateMin' in value &&
          'rateMax' in value
        ) {
          setMinCharge(String(value.rateMin));
          setMaxCharge(String(value.rateMax));
        }
        break;
    }

    setPendingResult(null);
    setAnswerError(null);
    setTypedAnswer('');
    setRecorderVersion((version) => version + 1);
  };

  const submitTypedAnswer = () => {
    const text = typedAnswer.trim();

    if (!text) {
      setAnswerError('আগে আপনার উত্তর লিখুন।');
      return;
    }

    extractText.mutate(
      { questionKey: currentQuestion.key, text },
      {
        onSuccess: (result) => {
          setPendingResult(result);
          setAnswerError(null);
        },
        onError: () => {
          setAnswerError('উত্তর বোঝা যায়নি। নিচের থেকে একটি বেছে নিন।');
        },
      },
    );
  };

  const next = () => {
    let valid = true;
    let message = 'অনুগ্রহ করে উত্তর দিন অথবা নিচের থেকে বেছে নিন।';

    if (step === 1) {
      valid = age !== null && age >= 16 && age <= 80;
      message = 'বয়স ১৬ থেকে ৮০ বছরের মধ্যে দিন।';
    } else if (step === 2) {
      valid =
        experience !== null && experience >= 0 && experience <= 60;
      message = 'আপনার কাজের অভিজ্ঞতা নির্বাচন করুন।';
    } else if (step === 3) {
      valid = selectedSkills.length > 0;
      message = 'অন্তত একটি কাজ বেছে নিন।';
    } else if (step === 4) {
      valid = selectedAreas.length > 0;
      message = 'অন্তত একটি এলাকা বেছে নিন।';
    } else if (step === 5) {
      const minimum = Number(minCharge);
      const maximum = Number(maxCharge);

      valid =
        minCharge.trim() !== '' &&
        maxCharge.trim() !== '' &&
        Number.isInteger(minimum) &&
        Number.isInteger(maximum) &&
        minimum >= 0 &&
        maximum >= minimum &&
        maximum <= 1_000_000;

      message = 'সর্বনিম্ন ও সর্বোচ্চ চার্জ সঠিকভাবে লিখুন।';
    }

    if (!valid) {
      setAnswerError(message);
      return;
    }

    setAnswerError(null);
    clearAnswerState();

    if (step < 5) {
      setStep((current) => current + 1);
    } else {
      setStep(6);
    }
  };

  const back = () => {
    setAnswerError(null);
    setPendingResult(null);

    if (step === 6) {
      setStep(5);
      return;
    }

    if (step > 1) {
      setStep((current) => current - 1);
      clearAnswerState();
    }
  };

  const toggleSkill = (slug: string) => {
    setSelectedSkills((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < 10
          ? [...current, slug]
          : current,
    );
    setAnswerError(null);
  };

  const toggleArea = (slug: string) => {
    setSelectedAreas((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < 10
          ? [...current, slug]
          : current,
    );
    setAnswerError(null);
  };

  if (step === 6) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-5 text-[#0b2b4c] sm:px-6">
        <div className="mx-auto max-w-2xl">
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#103963]"
            >
              <ArrowLeft className="size-5" /> ফিরে যান
            </button>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#103963] text-white">
                ক
              </span>
              কারিগর
            </div>
            <BadgeCheck className="size-5 text-emerald-600" />
          </header>

          <div className="mt-10">
            <p className="text-sm font-bold text-[#ff6f00]">প্রায় শেষ</p>
            <h1 className="mt-2 text-3xl font-bold">আপনার তথ্য দেখে নিন</h1>
            <p className="mt-2 text-slate-500">
              ভুল থাকলে ঠিক করে তারপর প্রোফাইল তৈরি করুন।
            </p>
          </div>

          <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold">
                নাম
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={50}
                  className="h-12 rounded-xl border border-slate-200 px-3 outline-none focus:border-[#103963]"
                  placeholder="আপনার নাম"
                />
              </label>

              <ReviewItem
                label="বয়স"
                value={age === null ? '—' : `${bn(age)} বছর`}
                onEdit={() => setStep(1)}
              />
              <ReviewItem
                label="অভিজ্ঞতা"
                value={experience === null ? '—' : `${bn(experience)} বছর`}
                onEdit={() => setStep(2)}
              />
              <ReviewItem
                label="কাজ"
                value={optionLabels(selectedSkills, skills)}
                onEdit={() => setStep(3)}
              />
              <ReviewItem
                label="এলাকা"
                value={optionLabels(selectedAreas, areas)}
                onEdit={() => setStep(4)}
              />
              <ReviewItem
                label="চার্জ"
                value={
                  minCharge && maxCharge
                    ? `৳${bn(minCharge)} – ৳${bn(maxCharge)}`
                    : '—'
                }
                onEdit={() => setStep(5)}
              />
            </div>

            <label className="mt-5 flex flex-col gap-2 text-sm font-bold">
              নিজের সম্পর্কে (ঐচ্ছিক)
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={300}
                placeholder="আপনার কাজের অভিজ্ঞতা সম্পর্কে লিখুন"
                className="min-h-24 rounded-xl border border-slate-200 p-3 outline-none focus:border-[#103963]"
              />
            </label>

            <Button
              size="lg"
              className="mt-6 h-12 w-full bg-[#ff6f00] text-base text-white hover:bg-[#e96300]"
              onClick={() =>
                toast.info('প্রোফাইল সংরক্ষণের সংযোগ পরের ধাপে যুক্ত করব।')
              }
            >
              প্রোফাইল তৈরি করুন <ArrowRight data-icon="inline-end" />
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck className="size-4" />
              আপনার তথ্য নিরাপদে রাখা হবে
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-5 text-[#0b2b4c] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#103963] disabled:invisible"
          >
            <ArrowLeft className="size-5" /> ফিরে যান
          </button>

          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#103963] text-white">
              ক
            </span>
            <span>কারিগর</span>
          </div>

          <button
            type="button"
            aria-label="সাহায্য"
            onClick={() => toast.info('প্রয়োজনে নিচের থেকে উত্তর বেছে নিন।')}
            className="flex size-11 items-center justify-center rounded-xl text-[#103963] hover:bg-white"
          >
            <CircleHelp className="size-5" />
          </button>
        </header>

        <section className="mt-7 flex-1">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#ff6f00]">
                কারিগর প্রোফাইল
              </p>
              <p className="mt-1 text-sm text-slate-500">
                একটি করে প্রশ্নের উত্তর দিন
              </p>
            </div>

            <span className="rounded-full bg-[#103963]/10 px-3 py-1.5 text-sm font-bold text-[#103963]">
              {bn(step)} / ৫
            </span>
          </div>

          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
<div
            className="mb-9 flex gap-2"
            aria-label={`ধাপ ${bn(step)} এর ${bn(5)}`}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full ${
                  item <= step ? 'bg-[#ff6f00]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {currentQuestion.question}
          </h1>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#103963]/10 bg-white px-4 py-3 shadow-sm">
            <button
              type="button"
              aria-label="প্রশ্ন শুনুন"
              onClick={playQuestion}
              className="flex size-11 items-center justify-center rounded-full bg-[#ff6f00] text-white"
            >
              <Play className="ml-0.5 size-5 fill-current" />
            </button>
            <p className="flex-1 text-sm font-medium text-slate-600">
              প্রশ্নটি শুনতে চাপুন
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2 text-sm font-bold text-[#103963]">
              <Mic2 className="size-4 text-[#ff6f00]" />
              কথা বলে উত্তর দিন
            </div>

            <div className="mt-5 rounded-2xl bg-[#f8fafc] px-4 py-6">
              {pendingResult ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  {pendingResult.value !== null ? (
                    <Check className="size-10 text-emerald-600" />
                  ) : (
                    <CircleHelp className="size-10 text-orange-500" />
                  )}

                  <p className="text-sm font-bold text-[#103963]">
                    আমরা শুনেছি:
                  </p>

                  <p className="text-slate-600">
                    {pendingResult.transcript || 'উত্তরটি বোঝা যায়নি।'}
                  </p>

                  <p className="text-lg font-bold text-[#103963]">
                    {resultLabel(pendingResult)}
                  </p>

                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Button size="lg" onClick={applyResult}>
                      ঠিক আছে
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setPendingResult(null);
                        setAnswerError(null);
                        setRecorderVersion((version) => version + 1);
                      }}
                    >
                      আবার বলুন
                    </Button>
                  </div>
                </div>
              ) : (
                <VoiceAnswerInput
                  key={`${step}-${recorderVersion}`}
                  questionKey={currentQuestion.key}
                  onResult={handleVoiceResult}
                  onError={handleVoiceError}
                />
              )}
            </div>

            {answerError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {answerError}
              </p>
            )}

            <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              অথবা ট্যাপ করে বেছে নিন
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <StepAnswer
              step={step}
              age={age}
              setAge={setAge}
              experience={experience}
              setExperience={setExperience}
              selectedSkills={selectedSkills}
              toggleSkill={toggleSkill}
              selectedAreas={selectedAreas}
              toggleArea={toggleArea}
              filteredAreas={filteredAreas}
              areaSearch={areaSearch}
              setAreaSearch={setAreaSearch}
              minCharge={minCharge}
              setMinCharge={setMinCharge}
              maxCharge={maxCharge}
              setMaxCharge={setMaxCharge}
            />

            <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              অথবা লিখে উত্তর দিন
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                maxLength={300}
                placeholder="এখানে উত্তর লিখুন"
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 outline-none focus:border-[#103963]"
              />
              <Button
                size="lg"
                variant="outline"
                disabled={extractText.isPending || !typedAnswer.trim()}
                onClick={submitTypedAnswer}
              >
                {extractText.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                উত্তর দিন
              </Button>
            </div>
          </div>
        </section>

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-400">আপনার তথ্য নিরাপদ থাকবে</p>
          <Button
            onClick={next}
            size="lg"
            className="h-12 min-w-32 bg-[#ff6f00] text-white hover:bg-[#e96300]"
          >
            {step === 5 ? 'দেখে নিন' : 'পরের ধাপ'}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </footer>
      </div>
    </main>
  );
}

type StepAnswerProps = {
  step: number;
  age: number | null;
  setAge: (value: number | null) => void;
  experience: number | null;
  setExperience: (value: number | null) => void;
  selectedSkills: string[];
  toggleSkill: (slug: string) => void;
  selectedAreas: string[];
  toggleArea: (slug: string) => void;
  filteredAreas: typeof areas;
  areaSearch: string;
  setAreaSearch: (value: string) => void;
  minCharge: string;
  setMinCharge: (value: string) => void;
  maxCharge: string;
  setMaxCharge: (value: string) => void;
};

function StepAnswer(props: StepAnswerProps) {
  const { step } = props;

  if (step === 1 || step === 2) {
    const value = step === 1 ? props.age : props.experience;
    const setValue = step === 1 ? props.setAge : props.setExperience;
    const minimum = step === 1 ? 16 : 0;
    const maximum = step === 1 ? 80 : 60;

    return (
      <div>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="কম করুন"
            onClick={() =>
              setValue(Math.max(minimum, (value ?? minimum) - 1))
            }
            className="flex size-14 items-center justify-center rounded-2xl border-2 border-slate-200 text-3xl hover:border-[#103963]"
          >
            −
          </button>

          <div className="min-w-24 text-center">
            <p className="text-5xl font-bold text-[#103963]">
              {value === null ? '—' : bn(value)}
            </p>
            <p className="mt-1 text-sm text-slate-500">বছর</p>
          </div>

          <button
            type="button"
            aria-label="বাড়ান"
            onClick={() =>
              setValue(Math.min(maximum, (value ?? minimum - 1) + 1))
            }
            className="flex size-14 items-center justify-center rounded-2xl border-2 border-slate-200 text-3xl hover:border-[#103963]"
          >
            +
          </button>
        </div>

        <input
          aria-label="টাইপ করে উত্তর দিন"
          value={value ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            setValue(
              raw === ''
                ? null
                : Math.min(
                    maximum,
                    Math.max(minimum, Number(raw) || minimum),
                  ),
            );
          }}
          className="mt-6 h-12 w-full rounded-xl border border-slate-200 px-4 text-center text-lg outline-none focus:border-[#103963]"
          inputMode="numeric"
          placeholder={step === 1 ? 'বয়স লিখুন' : 'বছর লিখুন'}
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {skills.map(({ slug, label, icon: Icon }) => {
          const active = props.selectedSkills.includes(slug);

          return (
            <button
              type="button"
              key={slug}
              onClick={() => props.toggleSkill(slug)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition ${
                active
                  ? 'border-[#ff6f00] bg-orange-50 text-[#103963]'
                  : 'border-slate-200 hover:border-[#103963]/30'
              }`}
            >
              <Icon
                className={`size-7 ${active ? 'text-[#ff6f00]' : 'text-[#103963]'}`}
              />
              <span className="text-sm font-bold">{label}</span>
              {active && <Check className="size-4 text-[#ff6f00]" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (step === 4) {
    return (
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-5 text-slate-400" />
          <input
            value={props.areaSearch}
            onChange={(event) => props.setAreaSearch(event.target.value)}
            aria-label="এলাকা খুঁজুন"
            placeholder="এলাকার নাম লিখুন"
            className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-4 outline-none focus:border-[#103963]"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {props.filteredAreas.map((area) => {
            const active = props.selectedAreas.includes(area.slug);

            return (
              <button
                type="button"
                key={area.slug}
                onClick={() => props.toggleArea(area.slug)}
                className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold ${
                  active
                    ? 'border-[#ff6f00] bg-orange-50'
                    : 'border-slate-200'
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-md border ${
                    active
                      ? 'border-[#ff6f00] bg-[#ff6f00] text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {active && <Check className="size-4" />}
                </span>
                {area.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <ChargeInput
          label="সর্বনিম্ন"
          value={props.minCharge}
          setValue={props.setMinCharge}
        />
        <ChargeInput
          label="সর্বোচ্চ"
          value={props.maxCharge}
          setValue={props.setMaxCharge}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['500', '1000', '1500', '2000'].map((amount) => (
          <button
            type="button"
            key={amount}
            onClick={() => props.setMinCharge(amount)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:border-[#ff6f00]"
          >
            ৳{bn(amount)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChargeInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-slate-600">
      {label}
      <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-[#103963]">
        <span className="text-lg">৳</span>
        <input
          aria-label={label}
          value={value}
          onChange={(event) =>
            setValue(event.target.value.replace(/\D/g, ''))
          }
          className="h-12 w-full bg-transparent px-2 text-xl font-bold outline-none"
          inputMode="numeric"
        />
      </div>
    </label>
  );
}

function ReviewItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm font-bold">
      <span>{label}</span>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 text-left font-medium text-slate-700 hover:bg-slate-100"
      >
        <span>{value || '—'}</span>
        <Pencil className="size-4 shrink-0 text-slate-400" />
      </button>
    </div>
  );
}
