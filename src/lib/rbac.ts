import type { Role } from "@prisma/client";

// Every module is visible and navigable by every authenticated role — the
// sidebar and route middleware no longer hide/block any menu item. Sensitive
// mutations (e.g. creating/editing users, deleting records) still enforce
// their own role checks independently inside each Server Action via
// requireRole()/requireSession() in src/lib/guard.ts, and data queries still
// scope by ownership where relevant (e.g. SALES only sees their own leads).
// This map only controls left-sidebar visibility and page-level navigation.
const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "OWNER",
  "SALES_MANAGER",
  "SALES",
  "ADMIN",
  "DIGITAL_MARKETING",
];

export const MODULE_ACCESS: Record<string, Role[]> = {
  dashboard: ALL_ROLES,
  units: ALL_ROLES,
  leads: ALL_ROLES,
  pipeline: ALL_ROLES,
  "follow-ups": ALL_ROLES,
  surveys: ALL_ROLES,
  bookings: ALL_ROLES,
  kpr: ALL_ROLES,
  sales: ALL_ROLES,
  marketing: ALL_ROLES,
  campaigns: ALL_ROLES,
  content: ALL_ROLES,
  reports: ALL_ROLES,
  tasks: ALL_ROLES,
  notifications: ALL_ROLES,
  settings: ALL_ROLES,
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
