"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#0f172a] sticky top-0 z-20">
      <div className="font-semibold text-lg md:hidden">Oncologia Flow</div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-2 rounded-full hidden md:block dark:bg-slate-800">
            <User size={18} className="text-slate-600 dark:text-slate-300" />
          </div>
          {loading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <span className="text-sm font-medium">{user?.nome}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout()} title="Sair">
          <LogOut size={18} className="text-rose-500" />
        </Button>
      </div>
    </header>
  );
}
