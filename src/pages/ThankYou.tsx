import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/PublicLayout';
import { format } from 'date-fns';

export default function ThankYou() {
  const [params] = useSearchParams();
  const bookingId = params.get('b') || '';

  const { data: booking } = useQuery({
    queryKey: ['thank-you-booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events:event_id(name), packages:package_id(name), parks:park_id(name), fields:field_id(name), spots:spot_id(label)')
        .eq('id', bookingId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  return (
    <PublicLayout>
      <div className="container py-16 max-w-xl text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">You're All Set!</h1>
        <p className="text-muted-foreground mb-8">Your sideline setup is booked. We'll handle everything — just show up and enjoy the game.</p>

        <Card className="border-2 border-border mb-8">
          <CardContent className="p-6 text-left">
            <h3 className="font-heading font-bold text-foreground mb-3">Booking Confirmation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono font-semibold text-xs">{bookingId.slice(0, 8)}…</span></div>
              {booking && (
                <>
                  {(booking.events as any)?.name && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-semibold">{(booking.events as any).name}</span></div>
                  )}
                  {(booking.packages as any)?.name && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Package</span><span className="font-semibold">{(booking.packages as any).name}</span></div>
                  )}
                  {booking.date && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{format(new Date(booking.date), 'MMM d, yyyy')}</span></div>
                  )}
                  {(booking.parks as any)?.name && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Park</span><span className="font-semibold">{(booking.parks as any).name}</span></div>
                  )}
                  {(booking.fields as any)?.name && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Field</span><span className="font-semibold">{(booking.fields as any).name} · Spot {(booking.spots as any)?.label}</span></div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-heading font-bold text-accent">${((booking.total_cents || 0) / 100).toFixed(2)}</span>
                  </div>
                  {(booking.loyalty_points_earned || 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Loyalty Points Earned</span>
                      <span className="font-semibold text-accent">+{booking.loyalty_points_earned}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-green-600 font-semibold">Confirmed</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to={`/receipt/${bookingId}`}>View Receipt</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/leave-review?booking=${bookingId}`}>
              <Star className="h-4 w-4 mr-1" /> Leave a Review
            </Link>
          </Button>
          <Button asChild className="bg-gradient-cta text-primary-foreground font-heading font-semibold">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
