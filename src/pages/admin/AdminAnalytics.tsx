import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CalendarCheck, Users, TrendingUp, Package, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(var(--muted-foreground))',
  paid: 'hsl(var(--primary))',
  photo_uploaded: 'hsl(var(--primary))',
  setup: 'hsl(var(--accent))',
  checked_in: 'hsl(142 71% 45%)',
  leaving: 'hsl(var(--accent))',
  picked_up: 'hsl(var(--muted-foreground))',
  closed: 'hsl(var(--muted-foreground))',
  cancelled: 'hsl(var(--destructive))',
};

export default function AdminAnalytics() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['analytics-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, total_cents, created_at, date, package_id, event_id, packages(name), events(name)')
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const { data: smsCount } = useQuery({
    queryKey: ['analytics-sms'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sms_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = useMemo(() => {
    if (!bookings) return null;

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const totalRevenue = bookings.reduce((s, b) => s + (b.total_cents || 0), 0);
    const paidBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'pending');
    const recentBookings = bookings.filter(b => b.created_at && isAfter(new Date(b.created_at), thirtyDaysAgo));
    const weekBookings = bookings.filter(b => b.created_at && isAfter(new Date(b.created_at), sevenDaysAgo));

    // Revenue by day (last 30 days)
    const revenueByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(now, i), 'MMM d');
      revenueByDay[day] = 0;
    }
    recentBookings.forEach(b => {
      if (b.created_at && b.status !== 'cancelled') {
        const day = format(new Date(b.created_at), 'MMM d');
        if (day in revenueByDay) {
          revenueByDay[day] += (b.total_cents || 0) / 100;
        }
      }
    });
    const revenueChart = Object.entries(revenueByDay).map(([day, amount]) => ({ day, amount }));

    // Bookings by status
    const statusCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const s = b.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const statusChart = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
      color: STATUS_COLORS[name] || 'hsl(var(--muted-foreground))',
    }));

    // Top packages
    const pkgCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const name = (b.packages as any)?.name || 'No package';
      pkgCounts[name] = (pkgCounts[name] || 0) + 1;
    });
    const topPackages = Object.entries(pkgCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Bookings per day (last 30 days)
    const bookingsPerDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(now, i), 'MMM d');
      bookingsPerDay[day] = 0;
    }
    recentBookings.forEach(b => {
      if (b.created_at) {
        const day = format(new Date(b.created_at), 'MMM d');
        if (day in bookingsPerDay) bookingsPerDay[day]++;
      }
    });
    const bookingsChart = Object.entries(bookingsPerDay).map(([day, count]) => ({ day, count }));

    return {
      totalRevenue,
      totalBookings: bookings.length,
      paidCount: paidBookings.length,
      weekCount: weekBookings.length,
      avgOrder: paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0,
      revenueChart,
      statusChart,
      topPackages,
      bookingsChart,
    };
  }, [bookings]);

  const KpiCard = ({ title, value, icon: Icon, sub }: { title: string; value: string; icon: any; sub?: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Analytics Dashboard</h1>

        {isLoading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Total Revenue" value={`$${(stats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} sub={`Avg order: $${(stats.avgOrder / 100).toFixed(2)}`} />
              <KpiCard title="Total Bookings" value={stats.totalBookings.toString()} icon={CalendarCheck} sub={`${stats.paidCount} paid`} />
              <KpiCard title="This Week" value={stats.weekCount.toString()} icon={TrendingUp} sub="Last 7 days" />
              <KpiCard title="SMS Sent" value={(smsCount || 0).toString()} icon={MessageSquare} sub="Total messages" />
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Revenue (Last 30 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} className="text-muted-foreground" />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings Trend */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Bookings Trend (30 Days)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.bookingsChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={6} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Bookings by Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie data={stats.statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                          {stats.statusChart.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {stats.statusChart.map(s => (
                        <div key={s.name} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="capitalize text-muted-foreground">{s.name}</span>
                          <span className="ml-auto font-medium text-foreground">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Packages */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Top Packages</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topPackages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
