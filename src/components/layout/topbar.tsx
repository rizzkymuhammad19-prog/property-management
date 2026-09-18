"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, Search } from "lucide-react";
import { ROLE_LABEL } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export function Topbar({ name, role }: { name: string; role: Role }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
          Project: ALL PROJECTS
        </span>
      </div>

      <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 md:flex">
        <Search className="h-4 w-4" />
        Search leads, units, sales...
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-gray-800">{name}</div>
          <div className="text-[11px] text-gray-400">{ROLE_LABEL[role]}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
