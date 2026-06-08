import {
  useEmployeeAuth,
  verifyEmployee,
  setEmployeeId,
  clearEmployeeId,
  getStoredEmployeeId,
  type Employee,
  type EmployeeAuth,
} from './useEmployeeAuth';

/**
 * Admin (employee) auth — the admin/owner threshold over the shared employee
 * auth core (useEmployeeAuth.tsx). Admins are re-verified against the DB on
 * every mount; only an active row with an admin-tier role is admitted.
 *
 * This is a UI/session gate only — see useEmployeeAuth.tsx for the full
 * UI-gate-vs-RLS security boundary (server-side enforcement is audited in
 * docs/RLS_AUDIT.md). The staff threshold lives in useStaffAuth.tsx.
 */

// Roles allowed into the admin area. Threshold decision (PR 2): `admin` and
// `owner` are the privileged roles; `crew`, `supervisor`, and `manager` are
// operational staff and belong to the lower-privilege /staff area, not the
// admin console.
export const ADMIN_ROLES = ['admin', 'owner'] as const;

// Re-export the canonical employee type under the historical name so existing
// admin call sites keep compiling.
export type AdminEmployee = Employee;

/** Pure role-threshold decision. Exported for direct unit testing. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role != null && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function setAdminEmployeeId(id: string): void {
  setEmployeeId(id);
}

export function clearAdminEmployeeId(): void {
  clearEmployeeId();
}

export { getStoredEmployeeId };

/**
 * Re-verify a stored employee id against the database. Returns the employee
 * (with the SERVER-sourced role) only if the row exists, is active, and holds
 * an admin-tier role. Returns null otherwise.
 */
export function verifyAdminEmployee(id: string): Promise<AdminEmployee | null> {
  return verifyEmployee(id, isAdminRole);
}

/**
 * Admin session hook. Re-verifies the stored employee id against the DB on
 * mount and keeps `loading` true until that resolves, so callers never flash
 * protected content before the admin-tier check completes.
 */
export function useAdminAuth(): EmployeeAuth {
  return useEmployeeAuth(isAdminRole);
}
