import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Pencil, Search, X } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  paid: 'bg-primary/10 text-primary',
  photo_uploaded: 'bg-primary/10 text-primary',
  setup: 'bg-accent/20 text-accent-foreground',
  checked_in: 'bg-success/20 text-success',
  leaving: 'bg-accent/20 text-accent-foreground',
  picked_up: 'bg-muted text-muted-foreground',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/20 text-destructive',
};

const statuses = ['all', 'pending', 'paid', 'photo_uploaded', 'setup', 'checked_in', 'leaving', 'picked_up', 'closed', 'cancelled'];

export default function AdminBookings() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(name), packages(name), parks(name), fields(name), spots(label)')
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      // Date range
      if (dateFrom && b.date && b.date < dateFrom) return false;
      if (dateTo && b.date && b.date > dateTo) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          (b.full_name || '').toLowerCase().includes(q) ||
          (b.team_name || '').toLowerCase().includes(q) ||
          (b.phone || '').includes(q) ||
          (b.contact_email || '').toLowerCase().includes(q) ||
          ((b.events as any)?.name || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, dateFrom, dateTo]);

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Booking updated'); setEditId(null); },
    onError: () => toast.error('Failed to update'),
  });

  const booking = bookings?.find(b => b.id === editId);
  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, team, phone, email, event..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-[150px] space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px] space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="w-[140px] space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Spot</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap">{b.date ? format(new Date(b.date), 'MMM d, yyyy') : '—'}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{b.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{b.team_name}</div>
                    </TableCell>
                    <TableCell>{(b.events as any)?.name || '—'}</TableCell>
                    <TableCell>{(b.packages as any)?.name || '—'}</TableCell>
                    <TableCell>{(b.spots as any)?.label || '—'}</TableCell>
                    <TableCell className="font-medium">${((b.total_cents || 0) / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[b.status || 'pending']}>{b.status || 'pending'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setEditId(b.id); setEditStatus(b.status || 'pending'); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{hasFilters ? 'No matching bookings' : 'No bookings yet'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!editId} onOpenChange={o => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Booking Status</DialogTitle></DialogHeader>
          {booking && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> {booking.full_name}</p>
                <p><span className="text-muted-foreground">Team:</span> {booking.team_name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {booking.phone}</p>
                <p><span className="text-muted-foreground">Email:</span> {booking.contact_email}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.filter(s => s !== 'all').map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
            <Button onClick={() => editId && updateMut.mutate({ id: editId, status: editStatus })} disabled={updateMut.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
