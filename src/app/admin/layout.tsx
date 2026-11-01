'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Briefcase,
  AlertTriangle,
  FileText,
  LogOut,
  Menu,
  X,
  LoaderCircle
} from 'lucide-react';
import { useSession } from '@/lib/session/use-session';
import { useRouter } from 'next/navigation';
import { logoutAccount } from '@/lib/auth';

const adminNavItems = [
  { href: '/admin', label: 'ড্যাশবোর্ড ও পরিসংখ্যান', icon: LayoutDashboard },
  { href: '/admin/verifications', label: 'কারিগর যাচাইকরণ', icon: ShieldCheck },
  { href: '/admin/users', label: 'ব্যবহারকারীগণ', icon: Users },
  { href: '/admin/jobs', label: 'সকল কাজ', icon: Briefcase },
  { href: '/admin/reports', label: 'অভিযোগ ও সমস্যা', icon: AlertTriangle },
  { href: '/admin/audit-logs', label: 'অডিট লগ', icon: FileText },
];

function AdminNavContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isLoading } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && (!session || session.role !== 'ADMIN')) {
      router.replace('/login?next=/admin');
    }
  }, [session, isLoading, router]);

  if (isLoading || !session || session.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand mx-auto mb-2" />
          <p className="text-sm text-slate-500">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutAccount();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-brand text-white p-4 flex items-center justify-between shadow-md">
        <Link href="/admin" className="font-extrabold text-lg tracking-tight">
          Karigor Admin
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-brand-dark text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col shadow-xl`}
      >
        <div className="p-6 border-b border-blue-900/50 hidden md:block">
          <Link href="/admin" className="text-xl font-extrabold text-white tracking-tight">
            Karigor <span className="text-accent">Admin</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">অ্যাডমিন কন্ট্রোল প্যানেল</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${isActive
                    ? 'bg-accent text-white shadow-md shadow-orange-500/20'
                    : 'hover:bg-blue-900/40 text-slate-300 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-900/50">
          <div className="mb-3 px-3 py-2 bg-blue-950/40 rounded-xl">
            <p className="text-xs text-slate-400">লগইন আছেন:</p>
            <p className="text-sm font-bold text-white truncate">{session.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white font-bold text-sm transition"
          >
            <LogOut size={16} /> লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <LoaderCircle className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <AdminNavContent>{children}</AdminNavContent>
    </Suspense>
  );
}