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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { canAccessModule } from "@/lib/rbac";

const NAV = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "units", href: "/dashboard/units", label: "Properties & Units", icon: Building2 },
  { key: "leads", href: "/dashboard/leads", label: "Leads (CRM)", icon: Users },
  { key: "pipeline", href: "/dashboard/pipeline", label: "Sales Pipeline", icon: Kanban },
  { key: "follow-ups", href: "/dashboard/follow-ups", label: "Follow Ups", icon: PhoneCall },
  { key: "surveys", href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
  { key: "bookings", href: "/dashboard/bookings", label: "Bookings", icon: FileCheck2 },
  { key: "kpr", href: "/dashboard/kpr", label: "KPR", icon: Landmark },
  { key: "sales", href: "/dashboard/sales", label: "Sales", icon: UserSquare2 },
  { key: "marketing", href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { key: "campaigns", href: "/dashboard/campaigns", label: "Campaigns", icon: Target },
  { key: "content", href: "/dashboard/content", label: "Content", icon: ImageIcon },
  { key: "reports", href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { key: "tasks", href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { key: "notifications", href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { key: "settings", href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-navy-800 bg-navy-900 md:flex">
      <div className="px-5 py-5">
        <div className="text-sm font-bold tracking-tight text-white">
          PROPERTY MANAGEMENT
        </div>
        <div className="text-[11px] text-navy-300">Command Center</div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.filter((item) => canAccessModule(role, item.key)).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-navy-700 text-white"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
