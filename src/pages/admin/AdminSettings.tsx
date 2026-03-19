import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        default_sport: settings.default_sport || '',
        support_email: settings.support_email || '',
        tax_rate_percent: (settings.tax_rate_percent ?? 0).toString(),
        service_fee_cents: (settings.service_fee_cents ?? 0).toString(),
        paypal_mode: settings.paypal_mode || 'sandbox',
        paypal_client_id: settings.paypal_client_id || '',
        square_app_id: (settings as any).square_app_id || '',
        square_location_id: (settings as any).square_location_id || '',
        square_environment: (settings as any).square_environment || 'sandbox',
      });
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        brand_name: form.brand_name,
        default_sport: form.default_sport,
        support_email: form.support_email || null,
        tax_rate_percent: Number(form.tax_rate_percent) || 0,
        service_fee_cents: Number(form.service_fee_cents) || 0,
        paypal_mode: form.paypal_mode,
        paypal_client_id: form.paypal_client_id || null,
        square_app_id: form.square_app_id || null,
        square_location_id: form.square_location_id || null,
        square_environment: form.square_environment || 'sandbox',
      };
      if (settings?.id) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-settings'] }); toast.success('Settings saved'); setEditing(false); },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Site Settings</h1>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
          ) : (
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="bg-gradient-cta text-primary-foreground font-heading"><Save className="h-4 w-4 mr-1" /> Save</Button>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Brand</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.brand_name || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Default Sport</Label>
                  <Input value={form.default_sport || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, default_sport: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input value={form.support_email || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" step="0.01" value={form.tax_rate_percent || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, tax_rate_percent: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Service Fee (cents)</Label>
                  <Input type="number" value={form.service_fee_cents || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, service_fee_cents: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">PayPal</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Input value={form.paypal_mode || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, paypal_mode: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input value={form.paypal_client_id || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, paypal_client_id: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Square Payments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Application ID</Label>
                  <Input value={form.square_app_id || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, square_app_id: e.target.value }))} placeholder="sq0idp-..." />
                </div>
                <div className="space-y-2">
                  <Label>Location ID</Label>
                  <Input value={form.square_location_id || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, square_location_id: e.target.value }))} placeholder="L..." />
                </div>
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Input value={form.square_environment || ''} disabled={!editing} onChange={e => setForm(f => ({ ...f, square_environment: e.target.value }))} placeholder="sandbox or production" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
