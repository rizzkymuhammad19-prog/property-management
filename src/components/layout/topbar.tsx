"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { ROLE_LABEL } from "@/lib/rbac";
import type { Role } from "@prisma/client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Topbar({
  name,
  role,
  onMenuClick,
}: {
  name: string;
  role: Role;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-white/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-surface-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-gray-600 sm:inline-block">
          Proyek: Semua Proyek
        </span>
      </div>

      <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-gray-400 md:flex">
        <Search className="h-4 w-4" />
        Cari leads, unit, sales...
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-surface-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        <div className="hidden items-center gap-2.5 border-l border-surface-border pl-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
            {initials(name)}
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold leading-tight text-gray-800">{name}</div>
            <div className="text-[11px] leading-tight text-gray-400">{ROLE_LABEL[role]}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full p-2 text-gray-500 hover:bg-surface-muted"
          title="Keluar"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
