import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function ThankYou() {
  const [params] = useSearchParams();
  const bookingId = params.get('b') || 'demo-001';

  return (
    <PublicLayout>
      <div className="container py-16 max-w-xl text-center">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">You're All Set!</h1>
        <p className="text-muted-foreground mb-8">Your sideline setup is booked. We'll handle everything — just show up and enjoy the game.</p>

        <Card className="border-2 border-border mb-8">
          <CardContent className="p-6 text-left">
            <h3 className="font-heading font-bold text-foreground mb-3">Booking Confirmation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono font-semibold">{bookingId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-success font-semibold">Confirmed</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">A confirmation email and SMS have been sent. (Demo mode)</p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
          <Button asChild className="bg-gradient-cta text-primary-foreground font-heading font-semibold">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
