import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type EventForm = {
  name: string; event_type: string; sport: string;
  start_date: string; end_date: string; is_active: boolean;
};
const empty: EventForm = { name: '', event_type: 'tournament', sport: 'softball', start_date: '', end_date: '', is_active: true };

export default function AdminEvents() {
  const qc = useQueryClient();
  const [form, setForm] = useState<EventForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('archived', false).order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from('events').update(form).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success(editId ? 'Event updated' : 'Event created'); close(); },
    onError: () => toast.error('Failed to save'),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').update({ archived: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event archived'); setDeleteId(null); },
  });

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (e: any) => {
    setForm({ name: e.name, event_type: e.event_type || 'tournament', sport: e.sport || 'softball', start_date: e.start_date || '', end_date: e.end_date || '', is_active: e.is_active ?? true });
    setEditId(e.id); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Events</h1>
          <Button onClick={openCreate} className="bg-gradient-cta text-primary-foreground font-heading"><Plus className="h-4 w-4 mr-1" /> New Event</Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                    <TableCell className="capitalize">{e.event_type || '—'}</TableCell>
                    <TableCell className="capitalize">{e.sport || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {e.start_date ? format(new Date(e.start_date), 'MMM d') : '?'} – {e.end_date ? format(new Date(e.end_date), 'MMM d, yyyy') : '?'}
                    </TableCell>
                    <TableCell><Badge variant={e.is_active ? 'default' : 'secondary'}>{e.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {events?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No events</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={o => !o && close()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit Event' : 'New Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select value={form.sport} onValueChange={v => setForm(f => ({ ...f, sport: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="softball">Softball</SelectItem>
                    <SelectItem value="baseball">Baseball</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={c => setForm(f => ({ ...f, is_active: c }))} />
              <Label>Active</Label>
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
          <AlertDialogHeader><AlertDialogTitle>Archive this event?</AlertDialogTitle><AlertDialogDescription>This will hide the event from public view.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
