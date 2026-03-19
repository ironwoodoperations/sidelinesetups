import { useState } from 'react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

const statuses = ['pending', 'paid', 'photo_uploaded', 'setup', 'checked_in', 'leaving', 'picked_up', 'closed', 'cancelled'];

export default function AdminBookings() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(name), packages(name), parks(name), fields(name), spots(label)')
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Booking updated'); setEditId(null); },
    onError: () => toast.error('Failed to update'),
  });

  const booking = bookings?.find(b => b.id === editId);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>
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
                {bookings?.map(b => (
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
                {bookings?.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
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
                    {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
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
