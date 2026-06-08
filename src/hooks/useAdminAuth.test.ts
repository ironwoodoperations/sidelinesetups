import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock the supabase client used by verifyAdminEmployee ---------------------
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
  isAdminRole,
  verifyAdminEmployee,
  ADMIN_ROLES,
} from './useAdminAuth';

describe('isAdminRole — admin-area role threshold', () => {
  it('admits admin and owner', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('owner')).toBe(true);
  });

  it('rejects the lower-privilege staff roles', () => {
    expect(isAdminRole('manager')).toBe(false);
    expect(isAdminRole('supervisor')).toBe(false);
    expect(isAdminRole('crew')).toBe(false);
  });

  it('rejects empty / unknown roles', () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole('')).toBe(false);
    expect(isAdminRole('superuser')).toBe(false);
  });

  it('only admin and owner are the configured threshold', () => {
    expect([...ADMIN_ROLES]).toEqual(['admin', 'owner']);
  });
});

describe('verifyAdminEmployee — server re-verification of the stored id', () => {
  beforeEach(() => maybeSingle.mockReset());

  it('returns the employee when the DB row is an active admin/owner', async () => {
    maybeSingle.mockResolvedValue({
      data: { id: 'e1', full_name: 'Avery Owner', role: 'owner', is_active: true },
      error: null,
    });
    const result = await verifyAdminEmployee('e1');
    expect(result).toEqual({ id: 'e1', full_name: 'Avery Owner', role: 'owner' });
  });

  it('returns null when the DB role is below the admin threshold', async () => {
    // A forged id that maps to a real-but-non-admin employee must NOT get in:
    // the role comes from the DB, never from the client.
    maybeSingle.mockResolvedValue({
      data: { id: 'e2', full_name: 'Casey Crew', role: 'crew', is_active: true },
      error: null,
    });
    expect(await verifyAdminEmployee('e2')).toBeNull();
  });

  it('returns null when no matching active row exists', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await verifyAdminEmployee('missing')).toBeNull();
  });

  it('returns null on a query error', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await verifyAdminEmployee('e1')).toBeNull();
  });
});
