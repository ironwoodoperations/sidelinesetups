import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock the supabase client used by verifyStaffEmployee ---------------------
// The query chain is supabase.from(..).select(..).eq(..).eq(..).maybeSingle().
// We let the test set what maybeSingle resolves to per case.
const maybeSingle = vi.fn();
vi.mock('@/integrations/supabase/client', () => {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = (...args: unknown[]) => maybeSingle(...args);
  return { supabase: { from: vi.fn(() => builder) } };
});

import {
  isStaffRole,
  verifyStaffEmployee,
  STAFF_ROLES,
} from './useStaffAuth';

describe('isStaffRole — staff-area role threshold', () => {
  it('admits the operational roles', () => {
    expect(isStaffRole('crew')).toBe(true);
    expect(isStaffRole('supervisor')).toBe(true);
    expect(isStaffRole('manager')).toBe(true);
  });

  it('also admits admin/owner (they are employees too)', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('owner')).toBe(true);
  });

  it('rejects empty / unknown roles', () => {
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
    expect(isStaffRole('')).toBe(false);
    expect(isStaffRole('superuser')).toBe(false);
  });

  it('threshold is exactly the five valid employee roles', () => {
    expect([...STAFF_ROLES]).toEqual(['crew', 'supervisor', 'manager', 'admin', 'owner']);
  });
});

describe('verifyStaffEmployee — server re-verification of the stored id', () => {
  beforeEach(() => maybeSingle.mockReset());

  it('returns the employee when the DB row is an active operational employee', async () => {
    maybeSingle.mockResolvedValue({
      data: { id: 'e1', full_name: 'Casey Crew', role: 'crew', is_active: true },
      error: null,
    });
    const result = await verifyStaffEmployee('e1');
    expect(result).toEqual({ id: 'e1', full_name: 'Casey Crew', role: 'crew' });
  });

  it('returns null when no matching active row exists (missing or inactive)', async () => {
    // The query filters on is_active=true, so an inactive/forged id yields no row.
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await verifyStaffEmployee('missing')).toBeNull();
  });

  it('returns null when the DB role is not a recognised employee role', async () => {
    // The role comes from the DB, never from the client — a corrupted/unknown
    // role is refused even on an "active" row.
    maybeSingle.mockResolvedValue({
      data: { id: 'e2', full_name: 'Mallory', role: 'superuser', is_active: true },
      error: null,
    });
    expect(await verifyStaffEmployee('e2')).toBeNull();
  });

  it('returns null on a query error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await verifyStaffEmployee('e1')).toBeNull();
  });
});
