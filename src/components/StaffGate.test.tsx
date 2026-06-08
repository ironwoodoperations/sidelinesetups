import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Control what the DB re-verification returns.
const maybeSingle = vi.fn();
vi.mock('@/integrations/supabase/client', () => {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = (...args: unknown[]) => maybeSingle(...args);
  return { supabase: { from: vi.fn(() => builder) } };
});

import StaffGate from './StaffGate';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/staff']}>
      <Routes>
        <Route
          path="/staff"
          element={
            <StaffGate>
              <div>secret staff content</div>
            </StaffGate>
          }
        />
        <Route path="/staff-login" element={<div>staff login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StaffGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    maybeSingle.mockReset();
  });

  it('redirects to /staff-login when there is no session, without flashing staff content', async () => {
    // No stored employee id.
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('staff login page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret staff content')).not.toBeInTheDocument();
  });

  it('redirects when the stored id resolves to no active employee row', async () => {
    sessionStorage.setItem('ss.employee', 'e-gone');
    maybeSingle.mockResolvedValue({ data: null, error: null });
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('staff login page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret staff content')).not.toBeInTheDocument();
  });

  it('renders staff content for an active operational employee (crew passes the threshold)', async () => {
    // Threshold distinction vs admin: crew is REJECTED by AdminLayout but
    // ADMITTED here — any active employee may reach the staff area.
    sessionStorage.setItem('ss.employee', 'e-crew');
    maybeSingle.mockResolvedValue({
      data: { id: 'e-crew', full_name: 'Casey Crew', role: 'crew', is_active: true },
      error: null,
    });
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('secret staff content')).toBeInTheDocument();
    });
    expect(screen.queryByText('staff login page')).not.toBeInTheDocument();
  });

  it('redirects when the stored id resolves to an unrecognised role', async () => {
    sessionStorage.setItem('ss.employee', 'e-bad');
    maybeSingle.mockResolvedValue({
      data: { id: 'e-bad', full_name: 'Mallory', role: 'superuser', is_active: true },
      error: null,
    });
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('staff login page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret staff content')).not.toBeInTheDocument();
  });
});
