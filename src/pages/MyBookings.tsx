import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Package, LogOut, User, FileText, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PublicLayout from '@/components/PublicLayout';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  paid: 'bg-blue-100 text-blue-800',
  photo_uploaded: 'bg-blue-100 text-blue-800',
  setup: 'bg-yellow-100 text-yellow-800',
  checked_in: 'bg-green-100 text-green-800',
  leaving: 'bg-orange-100 text-orange-800',
  picked_up: 'bg-muted text-muted-foreground',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/customer-login');
      return;
    }

    const fetchBookings = async () => {
      // Fetch by user_id OR by matching email/phone from profile
      let query = supabase
        .from('bookings')
        .select(`
          *,
          events:event_id (name, sport, event_type),
          packages:package_id (name),
          parks:park_id (name),
          fields:field_id (name),
          spots:spot_id (label)
        `)
        .order('created_at', { ascending: false });

      // Match by user_id or contact_email
      const email = user.email || profile?.email || '';
      query = query.or(`user_id.eq.${user.id},contact_email.ilike.${email}`);

      const { data, error } = await query;
      if (!error && data) setBookings(data);
      setLoading(false);
    };

    fetchBookings();
  }, [user, authLoading, profile, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/customer-login');
  };

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 max-w-2xl">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-12 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-sm text-muted-foreground">{profile?.full_name || user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
            <Button asChild className="bg-gradient-cta text-primary-foreground font-heading font-semibold">
              <Link to="/book">Book Your First Setup</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="shadow-card border-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-foreground">
                        {booking.events?.name || 'Event'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.packages?.name || 'Package'}
                      </p>
                    </div>
                    <Badge className={statusColors[booking.status || 'pending']}>
                      {booking.status || 'pending'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    {booking.date && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(booking.date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {booking.parks?.name && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.parks.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        {booking.fields?.name && (
                          <span className="text-muted-foreground">{booking.fields.name}</span>
                        )}
                        {booking.spots?.label && (
                          <span className="text-muted-foreground"> · Spot {booking.spots.label}</span>
                        )}
                      </div>
                      <Button asChild variant="ghost" size="sm" className="text-xs">
                        <Link to={`/receipt/${booking.id}`}>
                          <FileText className="h-3.5 w-3.5 mr-1" /> Receipt
                        </Link>
                      </Button>
                      {['closed', 'picked_up', 'paid'].includes(booking.status || '') && (
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                          <Link to={`/leave-review?booking=${booking.id}`}>
                            <Star className="h-3.5 w-3.5 mr-1" /> Review
                          </Link>
                        </Button>
                      )}
                    </div>
                    <span className="font-heading font-bold text-accent">
                      ${((booking.total_cents || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
