import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import AuthForm from "./auth-form";
import HomePageNav from "./home-page-nav";

type AuthMode = "login" | "register";

const authBenefits = [
  "ফোন নম্বর ও OTP দিয়ে সহজে শুরু করুন",
  "প্রস্তাব দেখে নিজের পছন্দে সিদ্ধান্ত নিন",
  "কাজ ও কারিগর—সব তথ্য এক জায়গায় রাখুন",
];

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <HomePageNav />
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-32 size-120 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 -left-36 size-105 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-16">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-[#b94f00] shadow-sm">
              <Sparkles size={16} />
              {isRegister ? "Karigor-এ আপনাকে স্বাগতম" : "আবার ফিরে আসায় স্বাগতম"}
            </div>
            <AuthForm mode={mode} />
            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              এগিয়ে যাওয়ার মাধ্যমে আপনি আপনার দেওয়া তথ্য অ্যাকাউন্ট তৈরি বা যাচাইয়ের জন্য
              ব্যবহারে সম্মতি দিচ্ছেন।
            </p>
          </div>

          <aside className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[32px] bg-[#103963] p-10 text-white shadow-2xl shadow-blue-950/15 xl:p-14">
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full border-40 border-white/5" />
              <div className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
                  <ShieldCheck size={29} />
                </div>
                <p className="mt-8 text-sm font-bold tracking-wider text-orange-200">
                  স্থানীয় কাজের সহজ সংযোগ
                </p>
                <h2 className="mt-3 max-w-lg text-4xl leading-tight font-extrabold">
                  সঠিক কাজের জন্য সঠিক কারিগর খুঁজুন।
                </h2>
                <p className="mt-5 max-w-lg leading-8 text-blue-100">
                  আপনার প্রয়োজন জানান, কারিগরদের প্রস্তাব দেখুন এবং নিজের সিদ্ধান্তে এগিয়ে
                  যান।
                </p>

                <ul className="mt-9 space-y-4">
                  {authBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                        <BadgeCheck size={18} />
                      </span>
                      <span className="text-sm font-medium text-blue-50">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-lg font-bold">আপনার কাজ, আপনার সিদ্ধান্ত</p>
                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Karigor আপনাকে প্রস্তাব তুলনা করে নিজের উপযুক্ত কারিগর বেছে নেওয়ার
                    সুযোগ দেয়।
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
