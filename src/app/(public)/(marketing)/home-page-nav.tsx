"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Hammer,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiClient";
import { logoutAccount, refreshAccessToken } from "@/lib/auth";
import { getCurrentUser, type SignedInUser } from "@/lib/jobs";

const sectionLinks = [
  { id: "services", label: "সার্ভিস" },
  { id: "how-it-works", label: "যেভাবে কাজ করে" },
  { id: "technicians", label: "কারিগরদের জন্য" },
];

const mainLinks = [
  { href: "/", label: "হোম" },
  { href: "/dashboard", label: "ড্যাশবোর্ড" },
  { href: "/about-us", label: "আমাদের সম্পর্কে" },
];

function NavLinks({
  closeMenu,
  pathname,
}: {
  closeMenu: () => void;
  pathname: string;
}) {
  return (
    <>
      {mainLinks.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard" ||
              pathname === "/jobs" ||
              /^\/jobs\/[^/]+\/bids$/.test(pathname)
            : pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 hover:text-[#FF6F00] ${
              isActive ? "bg-orange-50 text-[#c65300]" : "text-slate-600"
            }`}
          >
            {link.href === "/dashboard" && (
              <LayoutDashboard
                aria-hidden="true"
                className="mr-2 inline"
                size={16}
              />
            )}
            {link.label}
          </Link>
        );
      })}
      {pathname === "/" &&
        sectionLinks.map((link) => (
          <a
            key={link.id}
            href={`/#${link.id}`}
            onClick={closeMenu}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#FF6F00]"
          >
            {link.label}
          </a>
        ))}
    </>
  );
}

function accountLabel(role: SignedInUser["role"]) {
  if (role === "CUSTOMER") {
    return "গ্রাহক অ্যাকাউন্ট";
  }
  if (role === "TECHNICIAN") {
    return "কারিগর অ্যাকাউন্ট";
  }
  return "অ্যাডমিন অ্যাকাউন্ট";
}

export default function HomePageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isActive = true;
    setIsAuthLoading(true);

    void (async () => {
      try {
        await refreshAccessToken();
        const currentUser = await getCurrentUser();
        if (isActive) {
          setUser(currentUser);
        }
      } catch (error) {
        if (isActive && getApiErrorStatus(error) !== 401) {
          console.error(
            `Unable to load the signed-in user on ${pathname}.`,
            error,
          );
        }
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsAuthLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [pathname]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleLogout() {
    setAuthError("");
    setIsLoggingOut(true);
    try {
      await logoutAccount();
      setUser(null);
      closeMenu();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setAuthError(getApiErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          onClick={closeMenu}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#103963] to-[#1f5687] text-white shadow-lg shadow-blue-950/15 transition-transform group-hover:-rotate-6">
            <Hammer size={21} strokeWidth={2.2} />
          </span>
          <span className="text-[1.35rem] font-extrabold tracking-tight text-[#103963] sm:text-2xl">
            Karigor<span className="text-[#FF6F00]">.</span>
          </span>
        </Link>

        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden items-center gap-1 rounded-2xl border border-slate-100 bg-white/70 p-1 xl:flex"
        >
          <NavLinks closeMenu={closeMenu} pathname={pathname} />
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {isAuthLoading ? (
            <span className="flex size-10 items-center justify-center text-slate-400">
              <LoaderCircle
                aria-label="অ্যাকাউন্ট যাচাই হচ্ছে"
                className="animate-spin"
                size={19}
              />
            </span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex max-w-44 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left transition hover:border-blue-100 hover:bg-blue-50/60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#103963] shadow-sm">
                  <UserRound aria-hidden="true" size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#103963]">
                    {user.name}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500">
                    {accountLabel(user.role)}
                  </span>
                </span>
              </Link>
              {user.role === "CUSTOMER" && (
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6F00] px-3.5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  <BriefcaseBusiness size={16} />
                  কাজ পোস্ট
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <LogOut size={17} />
                )}
                লগআউট
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#103963] transition-colors hover:bg-slate-100"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#103963] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-[#0b2b4c]"
              >
                নিবন্ধন <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#103963] transition hover:border-blue-200 hover:bg-blue-50 xl:hidden"
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="মোবাইল নেভিগেশন"
          className="animate-in fade-in slide-in-from-top-2 border-t border-slate-100 bg-white px-4 py-4 duration-200 sm:px-8 xl:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavLinks closeMenu={closeMenu} pathname={pathname} />
            <div className="mt-2 border-t border-slate-100 pt-3">
              {isAuthLoading ? (
                <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                  <LoaderCircle className="animate-spin" size={17} />
                  অ্যাকাউন্ট যাচাই হচ্ছে
                </span>
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
                  >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#103963] shadow-sm">
                      <UserRound size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#103963]">
                        {user.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {accountLabel(user.role)}
                      </span>
                    </span>
                  </Link>
                  {user.role === "CUSTOMER" && (
                    <Link
                      href="/jobs/new"
                      onClick={closeMenu}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6F00] px-4 py-3 text-sm font-bold text-white"
                    >
                      <BriefcaseBusiness size={17} />
                      নতুন কাজ পোস্ট করুন
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoggingOut ? (
                      <LoaderCircle className="animate-spin" size={17} />
                    ) : (
                      <LogOut size={17} />
                    )}
                    লগআউট
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-[#103963] transition-colors hover:bg-slate-50"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#103963] px-5 py-3 text-sm font-bold text-white"
                  >
                    নিবন্ধন করুন <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {authError && (
        <p
          role="alert"
          className="border-t border-red-100 bg-red-50 px-5 py-2 text-center text-sm text-red-700"
        >
          লগআউট করা যায়নি: {authError}
        </p>
      )}
    </header>
  );
}
