import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ParkForm = { name: string; city: string; state: string; zip: string; street_address: string; park_type: string; };
const emptyPark: ParkForm = { name: '', city: '', state: '', zip: '', street_address: '', park_type: 'tournament' };

type FieldForm = { name: string; max_league_spots: string; };
const emptyField: FieldForm = { name: '', max_league_spots: '2' };

export default function AdminParks() {
  const qc = useQueryClient();
  const [selectedPark, setSelectedPark] = useState<string | null>(null);

  // Park CRUD
  const [parkForm, setParkForm] = useState<ParkForm>(emptyPark);
  const [parkEditId, setParkEditId] = useState<string | null>(null);
  const [parkOpen, setParkOpen] = useState(false);
  const [parkDeleteId, setParkDeleteId] = useState<string | null>(null);

  // Field CRUD
  const [fieldForm, setFieldForm] = useState<FieldForm>(emptyField);
  const [fieldEditId, setFieldEditId] = useState<string | null>(null);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [fieldDeleteId, setFieldDeleteId] = useState<string | null>(null);

  const { data: parks, isLoading } = useQuery({
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
      const { data, error } = await supabase.from('spots').select('*').in('field_id', fields.map(f => f.id));
      if (error) throw error;
      return data;
    },
    enabled: !!fields?.length,
  });

  // Park mutations
  const savePark = useMutation({
    mutationFn: async () => {
      if (parkEditId) {
        const { error } = await supabase.from('parks').update(parkForm).eq('id', parkEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('parks').insert(parkForm);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-parks'] }); toast.success('Saved'); setParkOpen(false); setParkEditId(null); },
    onError: () => toast.error('Failed'),
  });

  const delPark = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('parks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-parks'] }); toast.success('Deleted'); setParkDeleteId(null); if (selectedPark === parkDeleteId) setSelectedPark(null); },
  });

  // Field mutations
  const saveField = useMutation({
    mutationFn: async () => {
      const payload = { name: fieldForm.name, max_league_spots: Number(fieldForm.max_league_spots) || 2, park_id: selectedPark };
      if (fieldEditId) {
        const { error } = await supabase.from('fields').update(payload).eq('id', fieldEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fields').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-fields', selectedPark] }); toast.success('Saved'); setFieldOpen(false); setFieldEditId(null); },
    onError: () => toast.error('Failed'),
  });

  const delField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fields').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-fields', selectedPark] }); toast.success('Deleted'); setFieldDeleteId(null); },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Parks & Fields</h1>
          <Button onClick={() => { setParkForm(emptyPark); setParkEditId(null); setParkOpen(true); }} className="bg-gradient-cta text-primary-foreground font-heading">
            <Plus className="h-4 w-4 mr-1" /> New Park
          </Button>
        </div>

        {isLoading ? (
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
                    <TableHead className="w-20" />
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
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{p.name}</div>
                      </TableCell>
                      <TableCell>{p.city || '—'}, {p.state || ''}</TableCell>
                      <TableCell className="capitalize">{p.park_type || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => { setParkForm({ name: p.name, city: p.city || '', state: p.state || '', zip: p.zip || '', street_address: p.street_address || '', park_type: p.park_type || 'tournament' }); setParkEditId(p.id); setParkOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setParkDeleteId(p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedPark && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-foreground">Fields</h2>
                  <Button variant="outline" size="sm" onClick={() => { setFieldForm(emptyField); setFieldEditId(null); setFieldOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Field
                  </Button>
                </div>
                {fields?.map(field => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setFieldForm({ name: field.name, max_league_spots: (field.max_league_spots ?? 2).toString() }); setFieldEditId(field.id); setFieldOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setFieldDeleteId(field.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Max league spots: {field.max_league_spots || 0}</p>
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
                {fields?.length === 0 && <p className="text-muted-foreground text-sm">No fields for this park</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Park Dialog */}
      <Dialog open={parkOpen} onOpenChange={o => { if (!o) { setParkOpen(false); setParkEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{parkEditId ? 'Edit Park' : 'New Park'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={parkForm.name} onChange={e => setParkForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Street Address</Label><Input value={parkForm.street_address} onChange={e => setParkForm(f => ({ ...f, street_address: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={parkForm.city} onChange={e => setParkForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div className="space-y-2"><Label>State</Label><Input value={parkForm.state} onChange={e => setParkForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div className="space-y-2"><Label>ZIP</Label><Input value={parkForm.zip} onChange={e => setParkForm(f => ({ ...f, zip: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setParkOpen(false); setParkEditId(null); }}>Cancel</Button>
            <Button onClick={() => savePark.mutate()} disabled={!parkForm.name || savePark.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={fieldOpen} onOpenChange={o => { if (!o) { setFieldOpen(false); setFieldEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{fieldEditId ? 'Edit Field' : 'New Field'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={fieldForm.name} onChange={e => setFieldForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Max League Spots</Label><Input type="number" value={fieldForm.max_league_spots} onChange={e => setFieldForm(f => ({ ...f, max_league_spots: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFieldOpen(false); setFieldEditId(null); }}>Cancel</Button>
            <Button onClick={() => saveField.mutate()} disabled={!fieldForm.name || saveField.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Park */}
      <AlertDialog open={!!parkDeleteId} onOpenChange={o => !o && setParkDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this park?</AlertDialogTitle><AlertDialogDescription>All fields and spots will also be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => parkDeleteId && delPark.mutate(parkDeleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Field */}
      <AlertDialog open={!!fieldDeleteId} onOpenChange={o => !o && setFieldDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this field?</AlertDialogTitle><AlertDialogDescription>All spots will also be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => fieldDeleteId && delField.mutate(fieldDeleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
