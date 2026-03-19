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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type EqForm = { name: string; type: string; total_qty: string; available_qty: string; rented_qty: string; maintenance_qty: string; damaged_qty: string; };
const empty: EqForm = { name: '', type: 'tent', total_qty: '0', available_qty: '0', rented_qty: '0', maintenance_qty: '0', damaged_qty: '0' };
const types = ['tent', 'chair', 'cooler', 'sidewall', 'fan', 'lighting', 'audio', 'misc'];

export default function AdminEquipment() {
  const qc = useQueryClient();
  const [form, setForm] = useState<EqForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['admin-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, type: form.type, total_qty: Number(form.total_qty), available_qty: Number(form.available_qty), rented_qty: Number(form.rented_qty), maintenance_qty: Number(form.maintenance_qty), damaged_qty: Number(form.damaged_qty) };
      if (editId) {
        const { error } = await supabase.from('equipment').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('equipment').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-equipment'] }); toast.success('Saved'); close(); },
    onError: () => toast.error('Failed to save'),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-equipment'] }); toast.success('Deleted'); setDeleteId(null); },
  });

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (e: any) => {
    setForm({ name: e.name, type: e.type || 'misc', total_qty: (e.total_qty ?? 0).toString(), available_qty: (e.available_qty ?? 0).toString(), rented_qty: (e.rented_qty ?? 0).toString(), maintenance_qty: (e.maintenance_qty ?? 0).toString(), damaged_qty: (e.damaged_qty ?? 0).toString() });
    setEditId(e.id); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Equipment</h1>
          <Button onClick={openCreate} className="bg-gradient-cta text-primary-foreground font-heading"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>
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
                  <TableHead>Avail</TableHead>
                  <TableHead>Rented</TableHead>
                  <TableHead>Maint.</TableHead>
                  <TableHead>Dmg</TableHead>
                  <TableHead className="w-20" />
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={o => !o && close()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{types.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Total</Label><Input type="number" value={form.total_qty} onChange={e => setForm(f => ({ ...f, total_qty: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Available</Label><Input type="number" value={form.available_qty} onChange={e => setForm(f => ({ ...f, available_qty: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Rented</Label><Input type="number" value={form.rented_qty} onChange={e => setForm(f => ({ ...f, rented_qty: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Maintenance</Label><Input type="number" value={form.maintenance_qty} onChange={e => setForm(f => ({ ...f, maintenance_qty: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Damaged</Label><Input type="number" value={form.damaged_qty} onChange={e => setForm(f => ({ ...f, damaged_qty: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={!form.name || saveMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this item?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
