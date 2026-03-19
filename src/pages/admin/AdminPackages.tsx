import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type PkgForm = {
  name: string; description: string; per_game_usd: string; per_day_usd: string;
  full_weekend_usd: string; display_order: string; is_active: boolean;
};
const empty: PkgForm = { name: '', description: '', per_game_usd: '', per_day_usd: '', full_weekend_usd: '', display_order: '0', is_active: true };

export default function AdminPackages() {
  const qc = useQueryClient();
  const [form, setForm] = useState<PkgForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packages').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        per_game_usd: form.per_game_usd ? Number(form.per_game_usd) : null,
        per_day_usd: form.per_day_usd ? Number(form.per_day_usd) : null,
        full_weekend_usd: form.full_weekend_usd ? Number(form.full_weekend_usd) : null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      };
      if (editId) {
        const { error } = await supabase.from('packages').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('packages').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-packages'] }); toast.success('Saved'); close(); },
    onError: () => toast.error('Failed to save'),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-packages'] }); toast.success('Deleted'); setDeleteId(null); },
  });

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || '', per_game_usd: p.per_game_usd?.toString() || '', per_day_usd: p.per_day_usd?.toString() || '', full_weekend_usd: p.full_weekend_usd?.toString() || '', display_order: (p.display_order ?? 0).toString(), is_active: p.is_active ?? true });
    setEditId(p.id); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Packages</h1>
          <Button onClick={openCreate} className="bg-gradient-cta text-primary-foreground font-heading"><Plus className="h-4 w-4 mr-1" /> New Package</Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Per Game</TableHead>
                  <TableHead>Per Day</TableHead>
                  <TableHead>Weekend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages?.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell>{p.per_game_usd ? `$${p.per_game_usd}` : '—'}</TableCell>
                    <TableCell>{p.per_day_usd ? `$${p.per_day_usd}` : '—'}</TableCell>
                    <TableCell>{p.full_weekend_usd ? `$${p.full_weekend_usd}` : '—'}</TableCell>
                    <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editId ? 'Edit Package' : 'New Package'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Per Game ($)</Label><Input type="number" step="0.01" value={form.per_game_usd} onChange={e => setForm(f => ({ ...f, per_game_usd: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Per Day ($)</Label><Input type="number" step="0.01" value={form.per_day_usd} onChange={e => setForm(f => ({ ...f, per_day_usd: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Weekend ($)</Label><Input type="number" step="0.01" value={form.full_weekend_usd} onChange={e => setForm(f => ({ ...f, full_weekend_usd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={c => setForm(f => ({ ...f, is_active: c }))} /><Label>Active</Label></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete this package?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
