import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

export default function AdminParks() {
  const [selectedPark, setSelectedPark] = useState<string | null>(null);

  const { data: parks, isLoading: parksLoading } = useQuery({
    queryKey: ['admin-parks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parks').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: fields } = useQuery({
    queryKey: ['admin-fields', selectedPark],
    queryFn: async () => {
      const { data, error } = await supabase.from('fields').select('*').eq('park_id', selectedPark!);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPark,
  });

  const { data: spots } = useQuery({
    queryKey: ['admin-spots', selectedPark],
    queryFn: async () => {
      if (!fields?.length) return [];
      const fieldIds = fields.map(f => f.id);
      const { data, error } = await supabase.from('spots').select('*').in('field_id', fieldIds);
      if (error) throw error;
      return data;
    },
    enabled: !!fields?.length,
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Parks & Fields</h1>

        {parksLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Park Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parks?.map(p => (
                    <TableRow
                      key={p.id}
                      className={`cursor-pointer ${selectedPark === p.id ? 'bg-accent/10' : ''}`}
                      onClick={() => setSelectedPark(p.id)}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          {p.name}
                        </div>
                      </TableCell>
                      <TableCell>{p.city || '—'}, {p.state || ''}</TableCell>
                      <TableCell className="capitalize">{p.park_type || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedPark && fields && (
              <div className="space-y-4">
                {fields.map(field => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-3">
                        Max league spots: {field.max_league_spots || 0}
                      </div>
                      {spots && spots.filter(s => s.field_id === field.id).length > 0 && (
                        <div className="relative bg-muted rounded-lg aspect-video">
                          {spots.filter(s => s.field_id === field.id).map(spot => (
                            <div
                              key={spot.id}
                              className="absolute w-6 h-6 rounded-full bg-accent text-xs font-bold flex items-center justify-center text-accent-foreground -translate-x-1/2 -translate-y-1/2"
                              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                              title={spot.label}
                            >
                              {spot.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {fields.length === 0 && (
                  <p className="text-muted-foreground text-sm">No fields for this park</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
