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

type FaqForm = { question: string; answer: string; display_order: string; is_active: boolean; };
const empty: FaqForm = { question: '', answer: '', display_order: '0', is_active: true };

export default function AdminFaq() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FaqForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-faq'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faq_items').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { question: form.question, answer: form.answer, display_order: Number(form.display_order) || 0, is_active: form.is_active };
      if (editId) {
        const { error } = await supabase.from('faq_items').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faq_items').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faq'] }); toast.success('Saved'); close(); },
    onError: () => toast.error('Failed to save'),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faq_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faq'] }); toast.success('Deleted'); setDeleteId(null); },
  });

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (item: any) => {
    setForm({ question: item.question, answer: item.answer, display_order: (item.display_order ?? 0).toString(), is_active: item.is_active ?? true });
    setEditId(item.id); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">FAQ Items</h1>
          <Button onClick={openCreate} className="bg-gradient-cta text-primary-foreground font-heading"><Plus className="h-4 w-4 mr-1" /> New FAQ</Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.display_order}</TableCell>
                    <TableCell className="font-medium text-foreground max-w-md truncate">{item.question}</TableCell>
                    <TableCell><Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editId ? 'Edit FAQ' : 'New FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Question</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={c => setForm(f => ({ ...f, is_active: c }))} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={!form.question || !form.answer || saveMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this FAQ?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
