import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminSms() {
  const qc = useQueryClient();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string>('none');

  // Fetch SMS logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['sms-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent bookings for quick-send
  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings-sms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, full_name, phone, team_name, status')
        .eq('archived', false)
        .not('phone', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const sendMut = useMutation({
    mutationFn: async () => {
      const admin = JSON.parse(sessionStorage.getItem('ss.admin') || '{}');
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone,
          message,
          booking_id: selectedBooking !== 'none' ? selectedBooking : undefined,
          sent_by: admin.name || 'admin',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('SMS sent successfully');
      setMessage('');
      qc.invalidateQueries({ queryKey: ['sms-logs'] });
    },
    onError: (err: Error) => toast.error(`Failed to send: ${err.message}`),
  });

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBooking(bookingId);
    if (bookingId !== 'none') {
      const booking = bookings?.find(b => b.id === bookingId);
      if (booking?.phone) setPhone(booking.phone);
    }
  };

  const charCount = message.length;
  const charLimit = 160;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-foreground">SMS Notifications</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send SMS Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Send SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link to Booking (optional)</Label>
                <Select value={selectedBooking} onValueChange={handleBookingSelect}>
                  <SelectTrigger><SelectValue placeholder="Select a booking..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No booking</SelectItem>
                    {bookings?.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.full_name} — {b.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Message</Label>
                  <span className={`text-xs ${charCount > charLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {charCount}/{charLimit}
                  </span>
                </div>
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => sendMut.mutate()}
                disabled={!phone || !message || sendMut.isPending}
                className="w-full bg-gradient-cta text-primary-foreground font-heading"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMut.isPending ? 'Sending...' : 'Send SMS'}
              </Button>
            </CardContent>
          </Card>

          {/* SMS Log */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs?.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(new Date(log.created_at!), 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm">{log.message}</TableCell>
                          <TableCell>
                            <Badge className={log.status === 'sent' ? 'bg-primary/10 text-primary' : 'bg-destructive/20 text-destructive'}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.sent_by || '—'}</TableCell>
                        </TableRow>
                      ))}
                      {(!logs || logs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No messages sent yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
