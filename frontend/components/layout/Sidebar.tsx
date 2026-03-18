"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, BarChart3, UserCog, Settings, Bell, Search, LayoutGrid, ChevronDown, CheckCircle2, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    { title: 'Home',     href: '/',              icon: Home },
    { title: 'Atendimentos',  href: '/atendimentos',  icon: FileText },
    { title: 'Relatórios',    href: '/relatorios',    icon: BarChart3 },
    { title: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ title: 'Usuários', href: '/usuarios', icon: UserCog });
  }

  return (
    <div className="flex shrink-0">
      {/* Nível 1: Barra escura fina principal */}
      <aside className="w-16 bg-[#0f172a] text-slate-400 flex flex-col items-center py-4 border-r border-[#1e293b] min-h-screen">
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity mb-6">
          <UserCircle2 size={24} />
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-6 w-full">
          {[Home, Bell, CheckCircle2, LayoutGrid].map((Icon, i) => (
            <div key={i} className="hover:text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors w-10 h-10 flex items-center justify-center">
              <Icon size={20} />
            </div>
          ))}
        </nav>

        <div className="mt-auto hover:text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors w-10 h-10 flex items-center justify-center">
          <Settings size={20} />
        </div>
      </aside>

      {/* Nível 2: Barra clara interna com menus textuais */}
      <aside className="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col min-h-screen text-sm">
        <div className="h-14 flex items-center px-4 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer m-2 rounded-md transition-colors gap-2 group">
          <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">O</div>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">Oncologia Flow</span>
          <ChevronDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="px-4 py-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search workspaces" 
              className="w-full bg-slate-200/50 dark:bg-slate-900 border-none rounded-md h-9 pl-9 pr-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-shadow"
            />
          </div>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col px-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-2">Spaces</div>
          
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    active ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}
