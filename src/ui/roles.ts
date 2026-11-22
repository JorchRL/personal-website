// The anchor of a role on /about ("Roles I fit at a studio"), so the home
// page's employers' door can link each role it lists to its proof.

import { headingId } from "@/content/slug";

export function roleId(role: string): string {
  return `role-${headingId(role)}`;
}

export function rolePath(role: string): string {
  return `/about#${roleId(role)}`;
}
