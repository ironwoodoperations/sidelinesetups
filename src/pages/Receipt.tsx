import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import logoIcon from '@/assets/logo-icon.png';

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  photo_uploaded: 'Photo Uploaded',
  setup: 'Setting Up',
  checked_in: 'Checked In',
  leaving: 'Leaving',
  picked_up: 'Picked Up',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Receipt() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events:event_id (name, sport, event_type),
          packages:package_id (name, description),
          parks:park_id (name, street_address, city, state, zip),
          fields:field_id (name),
          spots:spot_id (label)
        `)
        .eq('id', id)
        .maybeSingle();
      if (!error && data) setBooking(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    // Use browser print-to-PDF as a simple cross-browser solution
    window.print();
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container py-12 max-w-2xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </PublicLayout>
    );
  }

  if (!booking) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Receipt Not Found</h1>
          <p className="text-muted-foreground mb-6">This booking doesn't exist or you don't have access.</p>
          <Button asChild variant="outline"><Link to="/my-bookings">Back to Bookings</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const addOns = Array.isArray(booking.add_ons) ? booking.add_ons : [];
  const lineItems = Array.isArray(booking.line_items_json) ? booking.line_items_json : [];
  const parkAddress = booking.parks
    ? [booking.parks.street_address, booking.parks.city, booking.parks.state, booking.parks.zip].filter(Boolean).join(', ')
    : '';

  return (
    <PublicLayout>
      {/* Action bar — hidden in print */}
      <div className="container py-4 max-w-2xl flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/my-bookings"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} className="bg-gradient-cta text-primary-foreground font-heading font-semibold">
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Receipt content */}
      <div ref={receiptRef} className="container py-6 max-w-2xl print:max-w-none print:py-0">
        <div className="bg-background border border-border rounded-lg p-8 print:border-0 print:rounded-none print:p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="Sideline Setups" className="h-10 w-10" />
              <div>
                <h1 className="font-heading text-xl font-bold text-primary">
                  Sideline <span className="text-accent">Setups</span>
                </h1>
                <p className="text-xs text-muted-foreground">East Texas Youth Sports</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-heading text-lg font-bold text-foreground">RECEIPT</h2>
              <p className="text-xs text-muted-foreground mt-1">
                #{booking.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.created_at ? format(new Date(booking.created_at), 'MMM d, yyyy') : ''}
              </p>
            </div>
          </div>

          {/* Customer + Event Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer</h3>
              <p className="text-sm font-semibold text-foreground">{booking.full_name}</p>
              {booking.contact_email && <p className="text-sm text-muted-foreground">{booking.contact_email}</p>}
              {booking.phone && <p className="text-sm text-muted-foreground">{booking.phone}</p>}
              {booking.team_name && <p className="text-sm text-muted-foreground">Team: {booking.team_name}</p>}
              {booking.coach_name && <p className="text-sm text-muted-foreground">Coach: {booking.coach_name}</p>}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Details</h3>
              {booking.events?.name && <p className="text-sm font-semibold text-foreground">{booking.events.name}</p>}
              {booking.date && <p className="text-sm text-muted-foreground">{format(new Date(booking.date), 'EEEE, MMM d, yyyy')}</p>}
              {booking.parks?.name && <p className="text-sm text-muted-foreground">{booking.parks.name}</p>}
              {parkAddress && <p className="text-xs text-muted-foreground">{parkAddress}</p>}
              {booking.fields?.name && <p className="text-sm text-muted-foreground">{booking.fields.name}{booking.spots?.label ? ` · Spot ${booking.spots.label}` : ''}</p>}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Details</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold text-foreground">Item</th>
                  <th className="text-right py-2 font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">
                    {booking.packages?.name || 'Package'}
                    {booking.package_mode && (
                      <span className="text-muted-foreground ml-1">
                        ({booking.package_mode === 'per_game' ? 'Per Game' : booking.package_mode === 'day' ? 'Full Day' : 'Full Weekend'})
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-medium">{formatCurrency(booking.base_cents || 0)}</td>
                </tr>
                {addOns.map((ao: any, i: number) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2 text-muted-foreground">
                      Add-on{ao.qty > 1 ? ` × ${ao.qty}` : ''}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">—</td>
                  </tr>
                ))}
                {(booking.add_on_cents || 0) > 0 && (
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Add-Ons Total</td>
                    <td className="py-2 text-right">{formatCurrency(booking.add_on_cents)}</td>
                  </tr>
                )}
                {(booking.discount_amount_cents || 0) > 0 && (
                  <tr className="border-b border-border">
                    <td className="py-2 text-green-600">Discount</td>
                    <td className="py-2 text-right text-green-600">-{formatCurrency(booking.discount_amount_cents)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-4 font-heading font-bold text-lg text-foreground">Total</td>
                  <td className="pt-4 text-right font-heading font-bold text-lg text-accent">
                    {formatCurrency(booking.total_cents || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status + Payment */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status: </span>
              <span className="text-sm font-semibold text-foreground">{statusLabel[booking.status] || booking.status}</span>
            </div>
            {booking.square_payment_id && (
              <div className="text-xs text-muted-foreground">
                Payment ID: {booking.square_payment_id}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for choosing Sideline Setups! Questions? Contact us at support.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} Sideline Setups · East Texas
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:max-w-none, .print\\:max-w-none * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          header, footer, nav { display: none !important; }
        }
      `}</style>
    </PublicLayout>
  );
}
