import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Shared employee (admin + staff) auth core — PIN-based, NOT Supabase Auth.
 *
 * Employees are not `auth.users`: the `employees` table is keyed by a random
 * uuid and authenticated by a PIN (see the employees migration). There is no
 * link between an `auth.users` session and an employee row, so the employee
 * gates cannot ride on `supabase.auth` the way the customer area (useAuth.tsx)
 * does.
 *
 * SECURITY BOUNDARY (PR 2 / PR 3): this is a UI/session gate only. It stops
 * casual access and drives UX, but it is client-trust — the browser asks the DB
 * "is this employee id active and allowed here?" and believes the answer. The
 * stored id is a bearer reference, and `employees` is currently world-readable.
 * Real, server-side enforcement of roles across tables lives in RLS; that is
 * audited in docs/RLS_AUDIT.md (PR 3 Part B). Until those RLS holes are closed,
 * this gate is NOT a substitute for RLS.
 *
 * The hardening this model gives: the gate never trusts a self-asserted role
 * stashed in sessionStorage (the old `ss.admin` / `ss.staff` blobs could be set
 * to any truthy value in the console to walk in). It stores ONLY the employee id
 * and re-reads the role + is_active from the database on every mount, so the
 * authorization decision is server-sourced, not forgeable in the client blob.
 *
 * Admin and staff differ ONLY in their role threshold (the `allow` predicate);
 * everything else — the bearer id, the DB re-verification, the loading/redirect
 * UX — is shared here. See useAdminAuth.tsx (admin/owner only) and
 * useStaffAuth.tsx (any active employee).
 */

// Every role the DB allows on an employee row. Mirrors the CHECK constraint on
// employees.role (see migration 20260319060537 — crew/supervisor/manager were
// the original operational roles; admin/owner were added later).
export const EMPLOYEE_ROLES = ['crew', 'supervisor', 'manager', 'admin', 'owner'] as const;

// sessionStorage key holding ONLY the authenticated employee id (a reference).
// Shared by both gates: it is a single employee identity; each gate applies its
// own role threshold when it re-reads the row. Deliberately NOT the old
// self-asserted {id,name,role} blob — just the id, re-verified per mount.
export const EMPLOYEE_SESSION_KEY = 'ss.employee';

export interface Employee {
  id: string;
  full_name: string;
  role: string;
}

/** Predicate deciding whether a server-sourced role may enter a given area. */
export type RolePredicate = (role: string | null | undefined) => boolean;

export function setEmployeeId(id: string): void {
  sessionStorage.setItem(EMPLOYEE_SESSION_KEY, id);
}

export function clearEmployeeId(): void {
  sessionStorage.removeItem(EMPLOYEE_SESSION_KEY);
}

export function getStoredEmployeeId(): string | null {
  return sessionStorage.getItem(EMPLOYEE_SESSION_KEY);
}

/**
 * Re-verify a stored employee id against the database. Returns the employee
 * (with the SERVER-sourced role) only if the row exists, is active, and the
 * `allow` predicate admits its role. Returns null otherwise.
 */
export async function verifyEmployee(id: string, allow: RolePredicate): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, role, is_active')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data || !allow(data.role)) return null;
  return { id: data.id, full_name: data.full_name, role: data.role };
}

export interface EmployeeAuth {
  employee: Employee | null;
  loading: boolean;
  signOut: () => void;
  refresh: () => Promise<void>;
}

/**
 * Employee session hook. On mount it re-verifies the stored employee id against
 * the DB using `allow`; `loading` stays true until that resolves so callers
 * never flash protected content before the check completes.
 *
 * NOTE: pass a STABLE `allow` reference (a module-level function such as
 * isAdminRole / isStaffRole), not an inline arrow — the verification effect
 * re-runs whenever `allow`'s identity changes.
 */
export function useEmployeeAuth(allow: RolePredicate): EmployeeAuth {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const id = getStoredEmployeeId();
    if (!id) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    const verified = await verifyEmployee(id, allow);
    if (!verified) clearEmployeeId();
    setEmployee(verified);
    setLoading(false);
  }, [allow]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    clearEmployeeId();
    setEmployee(null);
  }, []);

  return { employee, loading, signOut, refresh };
}
