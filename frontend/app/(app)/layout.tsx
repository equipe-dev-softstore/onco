import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-white dark:bg-[#0f172a] rounded-tl-xl border-l border-t border-slate-200 dark:border-slate-800 shadow-lg mt-0 ml-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto relative rounded-tl-xl bg-white dark:bg-[#0f172a]">
          {children}
        </main>
      </div>
    </div>
  );
}
