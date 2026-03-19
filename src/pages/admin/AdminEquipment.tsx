import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminEquipment() {
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['admin-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Equipment</h1>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Rented</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Damaged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment?.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{e.type || '—'}</Badge></TableCell>
                    <TableCell>{e.total_qty ?? 0}</TableCell>
                    <TableCell className="text-success">{e.available_qty ?? 0}</TableCell>
                    <TableCell>{e.rented_qty ?? 0}</TableCell>
                    <TableCell>{e.maintenance_qty ?? 0}</TableCell>
                    <TableCell className={e.damaged_qty ? 'text-destructive' : ''}>{e.damaged_qty ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
