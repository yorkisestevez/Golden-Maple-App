import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0F0E0A]">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 lg:pt-6 sm:p-8 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
