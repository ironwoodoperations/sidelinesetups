import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin (employee) auth — PIN-based, NOT Supabase Auth.
 *
 * Employees are not `auth.users`: the `employees` table is keyed by a random
 * uuid and authenticated by a PIN (see the employees migration). There is no
 * link between an `auth.users` session and an employee row, so the admin gate
 * cannot ride on `supabase.auth` the way the customer area (useAuth.tsx) does.
 *
 * SECURITY BOUNDARY (PR 2): this is a UI/session gate only. It stops casual
 * access and drives UX, but it is client-trust — the browser asks the DB "is
 * this employee id an active admin?" and believes the answer. The stored id is
 * a bearer reference, and `employees` is currently world-readable. Real,
 * server-side enforcement of the admin role across tables lives in RLS and is
 * audited and hardened separately in PR 3. Until PR 3 lands, this gate is NOT
 * a substitute for RLS.
 *
 * The hardening over the previous code: the gate no longer trusts a
 * self-asserted role stashed in sessionStorage (the old flag could be set to any
 * truthy value in the console to walk in). It stores only the employee id and
 * re-reads the role from the database on every mount, so the role/active state
 * is server-sourced, not forgeable in the client blob.
 */

// Roles allowed into the admin area. Threshold decision: `admin` and `owner`
// are the privileged roles; `manager`, `supervisor`, and `crew` are operational
// staff and belong to the lower-privilege /staff area, not the admin console.
export const ADMIN_ROLES = ['admin', 'owner'] as const;

// sessionStorage key holding ONLY the authenticated employee id (a reference).
// Deliberately a fresh key: the old one held a self-asserted {id,name,role}
// blob that the gate trusted; this one stores just the id, re-verified per mount.
const ADMIN_EMPLOYEE_KEY = 'ss.employee';

export interface AdminEmployee {
  id: string;
  full_name: string;
  role: string;
}

/** Pure role-threshold decision. Exported for direct unit testing. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role != null && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function setAdminEmployeeId(id: string): void {
  sessionStorage.setItem(ADMIN_EMPLOYEE_KEY, id);
}

export function clearAdminEmployeeId(): void {
  sessionStorage.removeItem(ADMIN_EMPLOYEE_KEY);
}

export function getStoredEmployeeId(): string | null {
  return sessionStorage.getItem(ADMIN_EMPLOYEE_KEY);
}

/**
 * Re-verify a stored employee id against the database. Returns the employee
 * (with the SERVER-sourced role) only if the row exists, is active, and holds
 * an admin-tier role. Returns null otherwise.
 */
export async function verifyAdminEmployee(id: string): Promise<AdminEmployee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, role, is_active')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data || !isAdminRole(data.role)) return null;
  return { id: data.id, full_name: data.full_name, role: data.role };
}

/**
 * Admin session hook. On mount it re-verifies the stored employee id against
 * the DB; `loading` stays true until that resolves so callers never flash
 * protected content before the check completes.
 */
export function useAdminAuth() {
  const [employee, setEmployee] = useState<AdminEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const id = getStoredEmployeeId();
    if (!id) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    const verified = await verifyAdminEmployee(id);
    if (!verified) clearAdminEmployeeId();
    setEmployee(verified);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    clearAdminEmployeeId();
    setEmployee(null);
  }, []);

  return { employee, loading, signOut, refresh };
}
