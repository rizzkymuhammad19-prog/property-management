import type { Role } from "@prisma/client";

// Which modules (matching the sitemap in the requirements doc) each role
// may open. "dashboard" is always allowed for every authenticated role.
export const MODULE_ACCESS: Record<string, Role[]> = {
  dashboard: [
    "SUPER_ADMIN",
    "OWNER",
    "SALES_MANAGER",
    "SALES",
    "ADMIN",
    "DIGITAL_MARKETING",
  ],
  units: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES", "ADMIN"],
  leads: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"],
  pipeline: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"],
  "follow-ups": ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"],
  surveys: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES", "ADMIN"],
  bookings: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES", "ADMIN"],
  kpr: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"],
  sales: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER"],
  marketing: ["SUPER_ADMIN", "OWNER", "DIGITAL_MARKETING"],
  campaigns: ["SUPER_ADMIN", "OWNER", "DIGITAL_MARKETING"],
  content: ["SUPER_ADMIN", "OWNER", "DIGITAL_MARKETING"],
  reports: [
    "SUPER_ADMIN",
    "OWNER",
    "SALES_MANAGER",
    "SALES",
    "ADMIN",
    "DIGITAL_MARKETING",
  ],
  tasks: ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"],
  notifications: [
    "SUPER_ADMIN",
    "OWNER",
    "SALES_MANAGER",
    "SALES",
    "ADMIN",
    "DIGITAL_MARKETING",
  ],
  settings: ["SUPER_ADMIN"],
};

export function canAccessModule(role: Role, moduleKey: string): boolean {
  const allowed = MODULE_ACCESS[moduleKey];
  if (!allowed) return true; // unknown module -> don't block, page itself should guard
  return allowed.includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OWNER: "Owner / Direksi",
  SALES_MANAGER: "Sales Manager",
  SALES: "Sales",
  ADMIN: "Admin",
  DIGITAL_MARKETING: "Digital Marketing",
};
