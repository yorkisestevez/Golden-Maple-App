'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, DollarSign, Code2, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/settings', label: 'Brand Settings', icon: Settings },
  { href: '/dashboard/pricing-engine', label: 'Pricing Engine', icon: DollarSign },
  { href: '/dashboard/embed', label: 'Embed Code', icon: Code2 },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#D4AF63]" style={{ fontFamily: 'Georgia, serif' }}>
          EstimateAI
        </h1>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-[#A89F91] hover:text-[#F2EEE7]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-[#D4AF63]/10 text-[#D4AF63]'
                  : 'text-[#A89F91] hover:text-[#F2EEE7] hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-[#A89F91] hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#1A1814] border border-white/10 rounded-lg text-[#A89F91] hover:text-[#F2EEE7]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1814] border-r border-white/10 flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1A1814] border-r border-white/10 min-h-screen flex-col shrink-0">
        {navContent}
      </aside>
    </>
  );
}
