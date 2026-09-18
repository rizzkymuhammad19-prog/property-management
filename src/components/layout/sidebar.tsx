"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  PhoneCall,
  ClipboardList,
  FileCheck2,
  Landmark,
  UserSquare2,
  Megaphone,
  Target,
  Image as ImageIcon,
  BarChart3,
  ListTodo,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { canAccessModule } from "@/lib/rbac";

const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "units", href: "/dashboard/units", label: "Properti & Unit", icon: Building2 },
    ],
  },
  {
    label: "Penjualan & CRM",
    items: [
      { key: "leads", href: "/dashboard/leads", label: "Leads (CRM)", icon: Users },
      { key: "pipeline", href: "/dashboard/pipeline", label: "Pipeline Penjualan", icon: Kanban },
      { key: "follow-ups", href: "/dashboard/follow-ups", label: "Follow Up", icon: PhoneCall },
      { key: "surveys", href: "/dashboard/surveys", label: "Survei", icon: ClipboardList },
      { key: "bookings", href: "/dashboard/bookings", label: "Booking", icon: FileCheck2 },
      { key: "kpr", href: "/dashboard/kpr", label: "KPR", icon: Landmark },
      { key: "sales", href: "/dashboard/sales", label: "Tim Sales", icon: UserSquare2 },
    ],
  },
  {
    label: "Marketing",
    items: [
      { key: "marketing", href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
      { key: "campaigns", href: "/dashboard/campaigns", label: "Kampanye", icon: Target },
      { key: "content", href: "/dashboard/content", label: "Konten", icon: ImageIcon },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { key: "reports", href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
      { key: "tasks", href: "/dashboard/tasks", label: "Tugas", icon: ListTodo },
      { key: "notifications", href: "/dashboard/notifications", label: "Notifikasi", icon: Bell },
      { key: "settings", href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: Role;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => canAccessModule(role, item.key)),
  })).filter((g) => g.items.length > 0);

  const content = (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Building2 className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight tracking-tight text-white">
              PROPERTY
            </div>
            <div className="text-[11px] leading-tight text-navy-300">Command Center</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-navy-300 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="thin-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-navy-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-navy-200 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                        active ? "bg-brand-gradient text-white" : "bg-white/5 text-navy-300 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
        <p className="text-[10.5px] leading-relaxed text-navy-300">
          Semua modul aktif dan siap digunakan.
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-sidebar-gradient lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar-gradient shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
