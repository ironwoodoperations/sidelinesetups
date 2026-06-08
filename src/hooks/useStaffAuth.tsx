import {
  useEmployeeAuth,
  verifyEmployee,
  setEmployeeId,
  clearEmployeeId,
  EMPLOYEE_ROLES,
  type Employee,
  type EmployeeAuth,
} from './useEmployeeAuth';

/**
 * Staff (employee) auth — the operational threshold over the shared employee
 * auth core (useEmployeeAuth.tsx). Mirrors useAdminAuth.tsx; the ONLY
 * difference is the role threshold.
 *
 * Threshold decision: the /staff area is for the OPERATIONAL roles
 * (crew / supervisor / manager) — i.e. ANY active employee row may reach it.
 * admin/owner are also employees and are admitted too (they outrank operational
 * staff and may use the floor console). The narrower admin/owner-only gate stays
 * in useAdminAuth.tsx, so /admin remains privileged while /staff is open to the
 * whole active roster.
 *
 * Like admin, this is a UI/session gate only — see useEmployeeAuth.tsx for the
 * UI-gate-vs-RLS boundary (server-side enforcement is audited in
 * docs/RLS_AUDIT.md).
 */

// Roles allowed into the staff area: every valid employee role. Re-exports the
// shared set so the threshold stays in lock-step with the employees.role CHECK
// constraint.
export const STAFF_ROLES = EMPLOYEE_ROLES;

export type StaffEmployee = Employee;

/**
 * Pure role-threshold decision: admit any recognised, active employee role.
 * Exported for direct unit testing.
 */
export function isStaffRole(role: string | null | undefined): boolean {
  return role != null && (STAFF_ROLES as readonly string[]).includes(role);
}

export function setStaffEmployeeId(id: string): void {
  setEmployeeId(id);
}

export function clearStaffEmployeeId(): void {
  clearEmployeeId();
}

/**
 * Re-verify a stored employee id against the database. Returns the employee
 * (with the SERVER-sourced role) only if the row exists, is active, and holds a
 * recognised employee role. Returns null otherwise.
 */
export function verifyStaffEmployee(id: string): Promise<StaffEmployee | null> {
  return verifyEmployee(id, isStaffRole);
}

/**
 * Staff session hook. Re-verifies the stored employee id against the DB on
 * mount and keeps `loading` true until that resolves, so callers never flash
 * protected content before the check completes.
 */
export function useStaffAuth(): EmployeeAuth {
  return useEmployeeAuth(isStaffRole);
}
