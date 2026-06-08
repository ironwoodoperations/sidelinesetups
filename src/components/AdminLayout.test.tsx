import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Keep the heavy sidebar tree out of this unit test.
vi.mock('@/components/AdminSidebar', () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar" />,
}));

// Control what the DB re-verification returns.
const maybeSingle = vi.fn();
vi.mock('@/integrations/supabase/client', () => {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = (...args: unknown[]) => maybeSingle(...args);
  return { supabase: { from: vi.fn(() => builder) } };
});

import AdminLayout from './AdminLayout';

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <div>secret admin content</div>
            </AdminLayout>
          }
        />
        <Route path="/admin-login" element={<div>admin login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminLayout gate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    maybeSingle.mockReset();
  });

  it('redirects to /admin-login when there is no session, without flashing admin content', async () => {
    // No stored employee id.
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('admin login page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret admin content')).not.toBeInTheDocument();
  });

  it('redirects when the stored id resolves to a non-admin role', async () => {
    sessionStorage.setItem('ss.employee', 'e-crew');
    maybeSingle.mockResolvedValue({
      data: { id: 'e-crew', full_name: 'Casey Crew', role: 'crew', is_active: true },
      error: null,
    });
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('admin login page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret admin content')).not.toBeInTheDocument();
  });

  it('renders admin content once a valid admin session is verified', async () => {
    sessionStorage.setItem('ss.employee', 'e-admin');
    maybeSingle.mockResolvedValue({
      data: { id: 'e-admin', full_name: 'Avery Admin', role: 'admin', is_active: true },
      error: null,
    });
    renderAt();
    await waitFor(() => {
      expect(screen.getByText('secret admin content')).toBeInTheDocument();
    });
    expect(screen.queryByText('admin login page')).not.toBeInTheDocument();
  });
});
