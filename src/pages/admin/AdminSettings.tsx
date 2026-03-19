import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Site Settings</h1>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Brand</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{settings.brand_name}</span></div>
                <div><span className="text-muted-foreground">Default Sport:</span> <span className="capitalize font-medium text-foreground">{settings.default_sport}</span></div>
                <div><span className="text-muted-foreground">Support Email:</span> <span className="font-medium text-foreground">{settings.support_email || '—'}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Tax Rate:</span> <span className="font-medium text-foreground">{settings.tax_rate_percent ?? 0}%</span></div>
                <div><span className="text-muted-foreground">Service Fee:</span> <span className="font-medium text-foreground">${((settings.service_fee_cents ?? 0) / 100).toFixed(2)}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">PayPal</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Mode:</span> <span className="capitalize font-medium text-foreground">{settings.paypal_mode}</span></div>
                <div><span className="text-muted-foreground">Client ID:</span> <span className="font-mono text-xs text-foreground">{settings.paypal_client_id ? '••••' + settings.paypal_client_id.slice(-8) : '—'}</span></div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-muted-foreground">No settings configured</p>
        )}
      </div>
    </AdminLayout>
  );
}
