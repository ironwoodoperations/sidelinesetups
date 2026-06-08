import { createContext, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import type { Employee } from '@/hooks/useEmployeeAuth';

/**
 * Staff route gate — the staff-side mirror of AdminLayout.
 *
 * Re-verifies the stored employee id against the DB (active + recognised role)
 * before rendering any staff content, shows a loading state while verifying
 * (never flashes protected content), and redirects to /staff-login on no/invalid
 * session. The verified employee is exposed to descendants via context so the
 * dashboard can read it without re-fetching.
 *
 * NOTE: this is a UI/session gate only — server-side RLS enforcement is audited
 * in docs/RLS_AUDIT.md and is NOT a substitute for it.
 */

interface StaffAuthValue {
  employee: Employee;
  signOut: () => void;
}

const StaffAuthContext = createContext<StaffAuthValue | null>(null);

/** Read the verified staff employee. Throws if used outside a <StaffGate>. */
export function useStaffEmployee(): StaffAuthValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffEmployee must be used within <StaffGate>');
  return ctx;
}

export default function StaffGate({ children }: { children: React.ReactNode }) {
  const { employee, loading, signOut } = useStaffAuth();

  // Never flash staff content before the check resolves.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }

  // No session or unrecognised/inactive employee → redirect to login.
  if (!employee) {
    return <Navigate to="/staff-login" replace />;
  }

  return (
    <StaffAuthContext.Provider value={{ employee, signOut }}>
      {children}
    </StaffAuthContext.Provider>
  );
}
