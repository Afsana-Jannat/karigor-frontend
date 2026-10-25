"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, getErrorMessage } from "@/lib/apiClient";
import {
  registerAccount,
  requestLoginOtp,
  type UserRole,
  verifyLoginOtp,
  verifyRegistrationOtp,
} from "@/lib/auth";
import { toAsciiDigits } from "@/lib/format";
import { sessionKey } from "@/lib/session/use-session";

type AuthMode = "login" | "register";
type AuthStep = "details" | "otp" | "complete";

const phonePattern = /^\+8801[3-9]\d{8}$/;

// Bangla digits and 01XXXXXXXXX are both fine. The API gets +8801XXXXXXXXX.
function normalizePhone(value: string) {
  const digits = toAsciiDigits(value).replace(/[\s-]/g, "");
  if (/^01[3-9]\d{8}$/.test(digits)) return `+88${digits}`;
  if (/^8801[3-9]\d{8}$/.test(digits)) return `+${digits}`;
  return digits;
}

// Demo mode only: the backend sends the OTP in the response instead of an SMS.
function showDemoCode(code?: string) {
  if (!code) return;
  toast.info(`ডেমো OTP: ${code}`, {
    id: "demo-otp", // a resend replaces the old toast
    description: "এটি ডেমো মোড। কোডটি নিচের ঘরে লিখুন।",
    duration: 120_000,
  });
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AuthStep>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedPhone = normalizePhone(phone);
    if (!phonePattern.test(normalizedPhone)) {
      setError("সঠিক মোবাইল নম্বর লিখুন, যেমন 01712345678।");
      return;
    }

    if (isRegister && name.trim().length < 2) {
      setError("আপনার নাম অন্তত ২ অক্ষরের হতে হবে।");
      return;
    }

    if (isRegister && name.trim().length > 100) {
      setError("আপনার নাম ১০০ অক্ষরের মধ্যে লিখুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isRegister
        ? await registerAccount({
            name: name.trim(),
            phone: normalizedPhone,
            role,
          })
        : await requestLoginOtp(normalizedPhone);

      setPhone(normalizedPhone);
      setDevCode(result.devCode ?? "");
      showDemoCode(result.devCode);
      setOtp("");
      setStep("otp");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          isRegister
            ? {
                CONFLICT: "এই নম্বর দিয়ে আগে নিবন্ধন হয়েছে। লগইন করুন।",
                FORBIDDEN: "এই অ্যাকাউন্টটি বন্ধ আছে।",
              }
            : {
                NOT_FOUND: "এই নম্বরে কোনো অ্যাকাউন্ট নেই।",
                FORBIDDEN: "এই অ্যাকাউন্টটি বন্ধ আছে।",
              },
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("৬ সংখ্যার OTP কোডটি লিখুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        const result = await verifyRegistrationOtp(phone, otp);
        if (!result.verified) {
          throw new Error(
            "OTP যাচাই করা যায়নি। কোডটি পরীক্ষা করে আবার চেষ্টা করুন।",
          );
        }
        toast.dismiss("demo-otp");
        setStep("complete");
        return;
      }

      const loginResult = await verifyLoginOtp(phone, otp);
      toast.dismiss("demo-otp");
      queryClient.setQueryData(sessionKey, loginResult.user);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(
        next?.startsWith("/") && !next.startsWith("//") ? next : "/",
      );
      router.refresh();
    } catch (verificationError) {
      setError(getApiErrorMessage(verificationError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setError("");
    setIsSubmitting(true);
    try {
      const result = isRegister
        ? await registerAccount({ name: name.trim(), phone, role })
        : await requestLoginOtp(phone);
      setDevCode(result.devCode ?? "");
      showDemoCode(result.devCode);
      setOtp("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "complete") {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-7 text-center shadow-xl shadow-blue-950/5 sm:p-9">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-[#103963]">
          নিবন্ধন সম্পন্ন হয়েছে
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          আপনার ফোন নম্বর যাচাই হয়েছে। এখন লগইন করে Karigor ব্যবহার শুরু করুন।
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103963] px-5 py-3.5 font-bold text-white transition hover:bg-[#0b2b4c]"
        >
          লগইন করুন <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-8">
      {step === "otp" ? (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setError("");
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#103963]"
          >
            <ArrowLeft size={16} /> তথ্য পরিবর্তন করুন
          </button>
          <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6F00]">
            <LockKeyhole size={23} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-[#103963]">
            OTP কোড যাচাই করুন
          </h1>
          <p className="mt-2 leading-7 text-slate-600">
            <span className="font-semibold text-slate-800">{phone}</span> নম্বরে
            পাঠানো ৬ সংখ্যার কোডটি লিখুন।
          </p>
        </>
      ) : (
        <>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6F00]">
            {isRegister ? <UserRound size={23} /> : <Phone size={23} />}
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-[#103963]">
            {isRegister ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "আপনার অ্যাকাউন্টে লগইন করুন"}
          </h1>
          <p className="mt-2 leading-7 text-slate-600">
            {isRegister
              ? "নিবন্ধনের জন্য আপনার তথ্য দিন। ফোনে OTP পাঠানো হবে।"
              : "ফোন নম্বর দিয়ে OTP নিন এবং নিরাপদে লগইন করুন।"}
          </p>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </p>
      )}

      {devCode && step === "otp" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ডেমো OTP: <strong className="font-mono">{devCode}</strong>
        </p>
      )}

      {step === "details" ? (
        <form onSubmit={requestCode} className="mt-7 space-y-5">
          {isRegister && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  আপনার নাম
                </span>
                <input
                  autoComplete="name"
                  maxLength={100}
                  minLength={2}
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="আপনার পুরো নাম"
                  required
                  value={name}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
                />
              </label>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-700">
                  আপনি কীভাবে Karigor ব্যবহার করবেন?
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["CUSTOMER", "কাজ করাব"],
                      ["TECHNICIAN", "কারিগর হিসেবে"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={role === value}
                      onClick={() => setRole(value)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        role === value
                          ? "border-[#103963] bg-blue-50 text-[#103963] ring-2 ring-blue-950/5"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              ফোন নম্বর
            </span>
            <input
              autoComplete="tel"
              inputMode="tel"
              maxLength={16}
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01712345678"
              required
              type="tel"
              value={phone}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
            />
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              উদাহরণ: 01712345678
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#103963] px-5 font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#0b2b4c] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" size={18} /> অপেক্ষা করুন
              </>
            ) : (
              <>
                OTP পাঠান <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              ৬ সংখ্যার OTP
            </span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              name="otp"
              onChange={(event) =>
                setOtp(
                  toAsciiDigits(event.target.value)
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              placeholder="••••••"
              required
              type="text"
              value={otp}
              className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-mono text-2xl tracking-[0.5em] text-[#103963] outline-none transition placeholder:text-slate-300 focus:border-[#103963] focus:ring-4 focus:ring-blue-950/5"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#103963] px-5 font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#0b2b4c] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" size={18} /> যাচাই হচ্ছে
              </>
            ) : (
              <>
                {isRegister ? "নম্বর যাচাই করুন" : "লগইন করুন"}{" "}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={resendCode}
            className="w-full py-2 text-sm font-semibold text-[#FF6F00] transition hover:text-orange-700 disabled:cursor-wait disabled:opacity-60"
          >
            কোড পাননি? আবার OTP পাঠান
          </button>
        </form>
      )}

      {step === "details" && (
        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "আগে থেকেই অ্যাকাউন্ট আছে?" : "নতুন Karigor অ্যাকাউন্ট লাগবে?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-bold text-[#FF6F00] hover:text-orange-700"
          >
            {isRegister ? "লগইন করুন" : "নিবন্ধন করুন"}
          </Link>
        </p>
      )}
    </div>
  );
}