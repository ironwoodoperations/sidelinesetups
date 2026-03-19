import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Save, ArrowLeft, MessageSquare, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    team_name: '',
    coach_name: '',
    sms_opt_in: true,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/customer-login'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        team_name: profile.team_name || '',
        coach_name: profile.coach_name || '',
        sms_opt_in: (profile as any).sms_opt_in ?? true,
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        team_name: form.team_name || null,
        coach_name: form.coach_name || null,
        sms_opt_in: form.sms_opt_in,
      } as any).eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 max-w-lg">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-12 max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="ghost" size="icon">
            <Link to="/my-bookings"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">Update your info so it's pre-filled when you book.</p>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <Card className="border-2 border-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-accent" /> Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoyaltyPointsDisplay userId={user?.id} />
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-accent" /> Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email can't be changed here.</p>
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(903) 555-1234" />
              </div>
              <div>
                <Label>Team Name</Label>
                <Input value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} placeholder="Your team name" />
              </div>
              <div>
                <Label>Coach Name</Label>
                <Input value={form.coach_name} onChange={e => setForm(f => ({ ...f, coach_name: e.target.value }))} placeholder="Coach name" />
              </div>

              {/* SMS Opt-in */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <Label className="font-medium">SMS Notifications</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive text updates about your bookings (confirmations, reminders, status changes).
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={form.sms_opt_in}
                    onCheckedChange={v => setForm(f => ({ ...f, sms_opt_in: v }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.sms_opt_in ? 'Opted in' : 'Opted out'}
                  </span>
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold">
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving…' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

function LoyaltyPointsDisplay({ userId }: { userId?: string }) {
  const { data: profileData } = useQuery({
    queryKey: ['loyalty-points', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: bookingStats } = useQuery({
    queryKey: ['booking-points-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('loyalty_points_earned, loyalty_points_redeemed')
        .eq('user_id', userId!)
        .eq('archived', false);
      if (error) throw error;
      const totalEarned = (data || []).reduce((s, b) => s + (b.loyalty_points_earned || 0), 0);
      const totalRedeemed = (data || []).reduce((s, b) => s + (b.loyalty_points_redeemed || 0), 0);
      return { totalEarned, totalRedeemed, bookingCount: data?.length || 0 };
    },
    enabled: !!userId,
  });

  const points = (profileData as any)?.loyalty_points || 0;
  const dollarValue = (points / 100).toFixed(2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Available Points</span>
        <span className="text-2xl font-heading font-bold text-accent">{points}</span>
      </div>
      <div className="text-xs text-muted-foreground">≈ ${dollarValue} discount value</div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{bookingStats?.bookingCount || 0}</p>
          <p className="text-xs text-muted-foreground">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{bookingStats?.totalEarned || 0}</p>
          <p className="text-xs text-muted-foreground">Earned</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{bookingStats?.totalRedeemed || 0}</p>
          <p className="text-xs text-muted-foreground">Redeemed</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Earn 1 point per $1 spent. Redeem 100 points = $1 off your next booking.
      </p>
    </div>
  );
}
