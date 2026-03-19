import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, RefreshCw, Camera, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import logoIcon from '@/assets/logo-icon.png';

const statusFlow = ['pending', 'paid', 'photo_uploaded', 'setup', 'checked_in', 'leaving', 'picked_up', 'closed'];
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

export default function StaffDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [staff, setStaff] = useState<{ id: string; name: string; role: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem('ss.staff');
    if (!s) { navigate('/staff-login', { replace: true }); return; }
    setStaff(JSON.parse(s));
  }, [navigate]);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['staff-bookings', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(name), packages(name), parks(name), fields(name), spots(label)')
        .eq('date', selectedDate)
        .eq('archived', false)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!staff,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-bookings'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const getNextStatus = (current: string) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const handlePhotoUpload = async (bookingId: string, file: File) => {
    setUploading(true);
    const path = `${bookingId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('id-photos').upload(path, file);
    if (uploadErr) { toast.error('Upload failed'); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(path);
    const { error: updateErr } = await supabase.from('bookings').update({
      id_photo_url: urlData.publicUrl,
      id_verified_by: staff?.name || 'staff',
      status: 'checked_in',
    }).eq('id', bookingId);

    setUploading(false);
    if (updateErr) { toast.error('Failed to save'); return; }
    qc.invalidateQueries({ queryKey: ['staff-bookings'] });
    toast.success('ID verified & checked in');
    setCheckInId(null);
  };

  const handleSkipId = async (bookingId: string) => {
    const { error } = await supabase.from('bookings').update({
      id_skip_approved_by: staff?.name || 'staff',
      needs_id_review: true,
      status: 'checked_in',
    }).eq('id', bookingId);
    if (error) { toast.error('Failed'); return; }
    qc.invalidateQueries({ queryKey: ['staff-bookings'] });
    toast.success('Checked in (ID skipped)');
    setCheckInId(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ss.staff');
    navigate('/staff-login');
  };

  const checkInBooking = bookings?.find(b => b.id === checkInId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="" className="h-7 w-7 brightness-0 invert" />
            <span className="font-heading text-sm font-bold">Staff</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-foreground/70">{staff?.name}</span>
            <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-4 space-y-4">
        {/* Date picker */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-heading"
          />
          <span className="text-sm text-muted-foreground">{bookings?.length ?? 0} booking{bookings?.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Bookings */}
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-heading font-semibold">No bookings for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings?.map(b => {
              const next = getNextStatus(b.status || 'pending');
              return (
                <Card key={b.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{b.full_name || 'Unknown'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{b.team_name} • {(b.events as any)?.name}</p>
                      </div>
                      <Badge className={statusColors[b.status || 'pending']}>{(b.status || 'pending').replace('_', ' ')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Package:</span> {(b.packages as any)?.name}</div>
                      <div><span className="text-muted-foreground">Spot:</span> {(b.spots as any)?.label || '—'}</div>
                      <div><span className="text-muted-foreground">Field:</span> {(b.fields as any)?.name}</div>
                      <div><span className="text-muted-foreground">Total:</span> ${((b.total_cents || 0) / 100).toFixed(2)}</div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {/* Check-in button when status is paid or photo_uploaded */}
                      {(b.status === 'paid' || b.status === 'photo_uploaded' || b.status === 'setup') && (
                        <Button size="sm" variant="outline" onClick={() => setCheckInId(b.id)} className="text-xs">
                          <Camera className="h-3 w-3 mr-1" /> Check In
                        </Button>
                      )}
                      {/* Next status button */}
                      {next && b.status !== 'paid' && b.status !== 'photo_uploaded' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ id: b.id, status: next })}
                          disabled={updateStatus.isPending}
                          className="text-xs bg-gradient-cta text-primary-foreground"
                        >
                          → {next.replace('_', ' ')}
                        </Button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'cancelled' })}
                          className="text-xs text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-in Dialog */}
      <Dialog open={!!checkInId} onOpenChange={o => !o && setCheckInId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Check In — ID Verification</DialogTitle></DialogHeader>
          {checkInBooking && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p className="font-medium text-foreground">{checkInBooking.full_name}</p>
                <p className="text-muted-foreground">{checkInBooking.team_name} • {checkInBooking.phone}</p>
              </div>

              {checkInBooking.id_photo_url ? (
                <div className="space-y-2">
                  <p className="text-sm text-success flex items-center gap-1"><CheckCircle className="h-4 w-4" /> ID already on file</p>
                  <img src={checkInBooking.id_photo_url} alt="ID" className="rounded-lg border border-border max-h-48 object-contain" />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Take or upload a photo of the customer's ID</p>
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{uploading ? 'Uploading...' : 'Tap to capture / upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={uploading}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file && checkInId) handlePhotoUpload(checkInId, file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!checkInBooking?.id_photo_url && (
              <Button variant="outline" onClick={() => checkInId && handleSkipId(checkInId)} className="text-xs">
                <XCircle className="h-4 w-4 mr-1" /> Skip ID (needs review)
              </Button>
            )}
            {checkInBooking?.id_photo_url && (
              <Button onClick={() => checkInId && updateStatus.mutate({ id: checkInId, status: 'checked_in' })} className="bg-gradient-cta text-primary-foreground">
                <CheckCircle className="h-4 w-4 mr-1" /> Confirm Check-In
              </Button>
            )}
            <Button variant="ghost" onClick={() => setCheckInId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
