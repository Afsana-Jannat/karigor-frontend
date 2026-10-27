
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Hammer,
  House,
  MapPin,
  MessageCircle,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";


const services = [
  {
    name: "ইলেকট্রিশিয়ান",
    description: "বৈদ্যুতিক কাজ ও মেরামত",
    icon: Zap,
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "প্লাম্বার",
    description: "পানির লাইন ও পাইপ মেরামত",
    icon: Droplets,
    color: "bg-sky-50 text-sky-600",
  },
  {
    name: "মেকানিক",
    description: "যন্ত্রপাতি ও মেশিন মেরামত",
    icon: Settings2,
    color: "bg-violet-50 text-violet-600",
  },
  {
    name: "হোম রিপেয়ার",
    description: "ঘরের ছোট-বড় মেরামত",
    icon: House,
    color: "bg-emerald-50 text-emerald-700",
  },
];

const steps = [
  {
    number: "01",
    title: "কাজের বিবরণ দিন",
    description: "আপনার কী কাজ দরকার, কোথায় এবং কখন—সহজেই জানান।",
  },
  {
    number: "02",
    title: "বিড ও প্রস্তাব দেখুন",
    description: "আগ্রহী কারিগরদের প্রস্তাব ও প্রোফাইল তুলনা করুন।",
  },
  {
    number: "03",
    title: "পছন্দের কারিগর বেছে নিন",
    description: "আপনার প্রয়োজন অনুযায়ী উপযুক্ত কারিগর নির্বাচন করুন।",
  },
];

const benefits = [
  {
    icon: BadgeCheck,
    title: "আপনার পছন্দ, আপনার সিদ্ধান্ত",
    description: "প্রস্তাব ও প্রোফাইল দেখে নিজের কাজের জন্য উপযুক্ত কারিগর বেছে নিন।",
  },
  {
    icon: MessageCircle,
    title: "কাজের কথা স্পষ্টভাবে বলুন",
    description:
      "কী কাজ দরকার তা আগে থেকেই জানান, যেন কারিগররা আপনার প্রয়োজন বুঝতে পারেন।",
  },
  {
    icon: ShieldCheck,
    title: "বেছে নিন আত্মবিশ্বাসের সাথে",
    description: "একাধিক প্রস্তাব তুলনা করে আপনার কাছে সঠিক মনে হয় এমন সিদ্ধান্ত নিন।",
  },
];

const faqs = [
  {
    question: "কীভাবে আমার কাজের জন্য কারিগর খুঁজব?",
    answer:
      "সার্ভিস থেকে কাজের ধরন বেছে নিন, আপনার প্রয়োজনের বিবরণ দিন এবং আগ্রহী কারিগরদের প্রস্তাব দেখুন।",
  },
  {
    question: "আমি কি কারিগরদের প্রস্তাব তুলনা করতে পারব?",
    answer:
      "হ্যাঁ। কারিগরদের প্রোফাইল ও প্রস্তাব দেখে আপনার প্রয়োজন অনুযায়ী উপযুক্ত ব্যক্তিকে বেছে নিতে পারবেন।",
  },
  {
    question: "কোনো কারিগরকে কীভাবে বেছে নেব?",
    answer:
      "প্রস্তাব ও প্রোফাইল মনোযোগ দিয়ে দেখে আপনার কাজ, সময় এবং পছন্দের সাথে যেটি মানানসই সেটি নির্বাচন করুন।",
  },
];

export default function HomePage() {
  return (
    <main className="scroll-smooth min-h-screen overflow-hidden bg-white text-slate-900 motion-reduce:scroll-auto">

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#fbfcfe]">
        <div className="pointer-events-none absolute -right-40 -top-32 size-120 rounded-full bg-orange-100/70 blur-3xl motion-safe:animate-pulse" />
        <div className="pointer-events-none absolute -left-48 top-48 size-105 rounded-full bg-blue-100/70 blur-3xl motion-safe:animate-pulse" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#10396312_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_bottom,black,transparent_75%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-24">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-700">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-[#b94f00] shadow-sm">
              <Sparkles size={16} />
              আপনার এলাকার কাজের সহজ সমাধান
            </div>

            <h1 className="max-w-2xl text-4xl leading-[1.2] font-extrabold tracking-tight text-[#103963] sm:text-5xl lg:text-[62px]">
              বিশ্বস্ত কারিগর,
              <br />
              <span className="relative inline-block text-[#FF6F00]">
                হাতের কাছেই।
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 260 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8C65 1 181 1 256 7"
                    stroke="#FF6F00"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              ইলেকট্রিশিয়ান, প্লাম্বার কিংবা মেকানিক—আপনার প্রয়োজন অনুযায়ী কারিগর খুঁজুন, প্রস্তাব
              দেখুন এবং নিজের পছন্দে কাজের জন্য কারিগর নির্বাচন করুন।
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6F00] px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl"
              >
                কারিগর খুঁজুন <ArrowRight size={19} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-[#103963] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                কীভাবে কাজ করে <ArrowDownRight size={18} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                যাচাইকৃত কারিগর
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                নিজের পছন্দে নির্বাচন
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:delay-150 motion-safe:duration-700">
            <div className="absolute -right-3 top-12 size-24 rounded-3xl bg-orange-100 sm:-right-6 sm:size-32" />
            <div className="absolute -bottom-5 -left-4 size-28 rounded-full bg-blue-100 sm:-left-8 sm:size-36" />

            <div className="relative rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    আপনার পরবর্তী কাজ
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#103963]">
                    সহজেই শুরু করুন
                  </h2>
                </div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#FF6F00] shadow-sm">
                  <Wrench size={25} />
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Zap size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">
                      ইলেকট্রিক লাইন মেরামত
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      আপনার কাজের বিবরণ দিন
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Users size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">কারিগরের প্রস্তাব</p>
                    <p className="mt-1 text-sm text-slate-500">
                      প্রস্তাবগুলো তুলনা করে দেখুন
                    </p>
                  </div>
                  <ArrowUpRight size={20} className="text-[#FF6F00]" />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#103963] p-4 text-white">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <p className="font-bold">সঠিক কারিগর বেছে নিন</p>
                  <p className="mt-1 text-sm text-blue-100">
                    আপনার প্রয়োজন, আপনার সিদ্ধান্ত
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between px-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} /> সুবিধাজনক ও সহজ
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={15} className="fill-orange-400 text-orange-400" />
                  <span className="font-semibold text-slate-700">
                    বিশ্বাসের সাথে
                  </span>
                </span>
              </div>
            </div>

            <div className="absolute -left-3 top-1/2 hidden -translate-y-1/2 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:flex sm:-left-10">
              <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6F00]">
                <MapPin size={20} />
              </span>
              <div>
                <p className="text-xs text-slate-500">আপনার এলাকা</p>
                <p className="font-bold text-[#103963]">আপনার পছন্দমতো</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="border-y border-slate-100 bg-slate-50/70 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
                আমাদের সার্ভিস
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
                যে কাজই হোক, শুরু হোক এখানেই
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                আপনার কাজের ধরন বেছে নিন এবং প্রয়োজনীয় কারিগর খোঁজার প্রক্রিয়া শুরু করুন।
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#103963]">
              আপনার কাজ, আপনার সিদ্ধান্ত <ArrowUpRight size={17} />
            </span>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.name}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
                >
                  <span
                    className={`flex size-14 items-center justify-center rounded-2xl ${service.color}`}
                  >
                    <Icon size={27} strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-[#103963]">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>
                  <a
                    href="#how-it-works"
                    aria-label={`${service.name} সম্পর্কে জানুন`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#FF6F00] transition group-hover:gap-3"
                  >
                    বিস্তারিত <ArrowRight size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-40 top-1/4 size-96 rounded-full bg-blue-50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
              আপনার কাজ, আপনার নিয়ন্ত্রণে
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
              সহজভাবে সিদ্ধান্ত নিন
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              প্রয়োজন জানান, প্রস্তাব দেখুন, তারপর নিজের পছন্দে কারিগর বেছে নিন।
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-950/5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#103963] text-white shadow-lg shadow-blue-950/15">
                    <Icon size={23} />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-[#103963]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
              মাত্র তিনটি ধাপ
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
              কাজ খোঁজা এখন আরও সহজ
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              কাজ পোস্ট করা থেকে কারিগর নির্বাচন—প্রক্রিয়াটি আপনার নিয়ন্ত্রণেই থাকবে।
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5"
              >
                <span className="text-5xl font-black tracking-tight text-orange-100">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-bold text-[#103963]">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-y border-slate-100 bg-slate-50/70 py-20 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-sm font-bold tracking-wider text-[#FF6F00]">
              আপনার জিজ্ঞাসা
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#103963] sm:text-4xl">
              কিছু জানতে চান?
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-600">
              Karigor-এ কাজ খোঁজার প্রক্রিয়া সম্পর্কে সাধারণ প্রশ্নগুলোর উত্তর এখানে দেখুন।
            </p>
            <a
              href="#services"
              className="mt-7 inline-flex items-center gap-2 font-bold text-[#FF6F00] transition hover:gap-3"
            >
              সার্ভিসগুলো দেখুন <ArrowRight size={17} />
            </a>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white px-5 transition-colors open:border-orange-200 sm:px-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold text-[#103963] marker:hidden">
                  {faq.question}
                  <ChevronRight
                    size={19}
                    className="shrink-0 text-[#FF6F00] transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>
                <p className="max-w-2xl pb-5 leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Technician CTA */}
      <section
        id="technicians"
        className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12"
      >
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#103963] px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-40 border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 size-64 rounded-full bg-orange-500/10 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-orange-200">
                <UserRound size={16} /> দক্ষ কারিগরদের জন্য
              </span>
              <h2 className="mt-5 text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                আপনার দক্ষতাকে দিন নতুন সুযোগ
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-blue-100">
                নিজের দক্ষতা তুলে ধরুন, কাজের প্রস্তাব দিন এবং আপনার উপযুক্ত কাজ বেছে নেওয়ার
                সুযোগ তৈরি করুন।
              </p>
            </div>

            <Link
              href="#how-it-works"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#FF6F00] px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 md:self-center"
            >
              শুরু করার ধাপ দেখুন <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#103963] text-white">
              <Hammer size={20} />
            </span>
            <span className="text-xl font-extrabold text-[#103963]">
              Karigor<span className="text-[#FF6F00]">.</span>
            </span>
          </Link>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            দক্ষ কারিগর ও কাজের প্রয়োজন—দুয়ের মধ্যে সহজ সংযোগ তৈরি করাই আমাদের লক্ষ্য।
          </p>

          <nav
            aria-label="ফুটার নেভিগেশন"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600"
          >
            <a
              className="transition-colors hover:text-[#FF6F00]"
              href="#services"
            >
              সার্ভিস
            </a>
            <a
              className="transition-colors hover:text-[#FF6F00]"
              href="#how-it-works"
            >
              কাজের ধাপ
            </a>
            <a className="transition-colors hover:text-[#FF6F00]" href="#faq">
              প্রশ্নোত্তর
            </a>
          </nav>

          <p className="text-sm text-slate-500">
            © 2026 Karigor. সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </main>
  );
}
