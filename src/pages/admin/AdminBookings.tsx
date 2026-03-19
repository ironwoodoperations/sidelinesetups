import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AdminBookings() {
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
                  </TableRow>
                ))}
                {bookings?.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
