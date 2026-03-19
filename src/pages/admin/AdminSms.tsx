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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, FileText, Plus, Pencil, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BOOKING_STATUSES = ['pending', 'paid', 'photo_uploaded', 'setup', 'checked_in', 'leaving', 'picked_up', 'closed', 'cancelled'];

export default function AdminSms() {
  const qc = useQueryClient();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string>('none');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');

  // Template editor state
  const [tplDialog, setTplDialog] = useState(false);
  const [tplEditId, setTplEditId] = useState<string | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplCategory, setTplCategory] = useState('general');

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

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent bookings
  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings-sms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, full_name, phone, team_name, status, date, contact_email, events(name), parks(name)')
        .eq('archived', false)
        .not('phone', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch auto-SMS rules
  const { data: autoRules } = useQuery({
    queryKey: ['sms-auto-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_auto_rules')
        .select('*')
        .order('created_at', { ascending: true });
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
      setSelectedTemplate('none');
      qc.invalidateQueries({ queryKey: ['sms-logs'] });
    },
    onError: (err: Error) => toast.error(`Failed to send: ${err.message}`),
  });

  // Template CRUD
  const saveTplMut = useMutation({
    mutationFn: async () => {
      const payload = { name: tplName, body: tplBody, category: tplCategory };
      if (tplEditId) {
        const { error } = await supabase.from('sms_templates').update(payload).eq('id', tplEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sms_templates').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Template saved');
      setTplDialog(false);
      qc.invalidateQueries({ queryKey: ['sms-templates'] });
    },
    onError: () => toast.error('Failed to save template'),
  });

  const deleteTplMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sms_templates').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template deleted');
      qc.invalidateQueries({ queryKey: ['sms-templates'] });
    },
  });

  // Auto-rule mutations
  const upsertRuleMut = useMutation({
    mutationFn: async ({ status, templateId, isActive }: { status: string; templateId: string | null; isActive: boolean }) => {
      const existing = autoRules?.find(r => r.status_trigger === status);
      if (existing) {
        const { error } = await supabase.from('sms_auto_rules').update({ template_id: templateId, is_active: isActive }).eq('id', existing.id);
        if (error) throw error;
      } else if (templateId) {
        const { error } = await supabase.from('sms_auto_rules').insert({ status_trigger: status, template_id: templateId, is_active: isActive });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Auto-SMS rule saved');
      qc.invalidateQueries({ queryKey: ['sms-auto-rules'] });
    },
    onError: () => toast.error('Failed to save rule'),
  });

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBooking(bookingId);
    if (bookingId !== 'none') {
      const booking = bookings?.find(b => b.id === bookingId);
      if (booking?.phone) setPhone(booking.phone);
      if (selectedTemplate !== 'none') {
        const tpl = templates?.find(t => t.id === selectedTemplate);
        if (tpl) setMessage(applyVariables(tpl.body, booking));
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId !== 'none') {
      const tpl = templates?.find(t => t.id === templateId);
      if (tpl) {
        const booking = selectedBooking !== 'none' ? bookings?.find(b => b.id === selectedBooking) : null;
        setMessage(applyVariables(tpl.body, booking));
      }
    }
  };

  const applyVariables = (body: string, booking: any) => {
    if (!booking) return body;
    return body
      .replace(/\{\{name\}\}/g, booking.full_name || '')
      .replace(/\{\{team\}\}/g, booking.team_name || '')
      .replace(/\{\{date\}\}/g, booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : '')
      .replace(/\{\{event\}\}/g, (booking.events as any)?.name || '')
      .replace(/\{\{park\}\}/g, (booking.parks as any)?.name || '')
      .replace(/\{\{phone\}\}/g, booking.phone || '')
      .replace(/\{\{email\}\}/g, booking.contact_email || '');
  };

  const openNewTemplate = () => { setTplEditId(null); setTplName(''); setTplBody(''); setTplCategory('general'); setTplDialog(true); };
  const openEditTemplate = (tpl: any) => { setTplEditId(tpl.id); setTplName(tpl.name); setTplBody(tpl.body); setTplCategory(tpl.category || 'general'); setTplDialog(true); };

  const getRuleForStatus = (status: string) => autoRules?.find(r => r.status_trigger === status);

  const charCount = message.length;
  const charLimit = 160;
  const categories = ['confirmation', 'reminder', 'status', 'cancellation', 'followup', 'general'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-foreground">SMS Notifications</h1>
        </div>

        <Tabs defaultValue="send">
          <TabsList>
            <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" /> Send</TabsTrigger>
            <TabsTrigger value="automation"><Zap className="h-4 w-4 mr-1" /> Automation</TabsTrigger>
            <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" /> Templates</TabsTrigger>
            <TabsTrigger value="history"><MessageSquare className="h-4 w-4 mr-1" /> History</TabsTrigger>
          </TabsList>

          {/* SEND TAB */}
          <TabsContent value="send">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Compose Message</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template (optional)</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {templates?.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Input placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Message</Label>
                      <span className={`text-xs ${charCount > charLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {charCount}/{charLimit}
                      </span>
                    </div>
                    <Textarea placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} rows={4} />
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
              <Card>
                <CardHeader><CardTitle className="text-lg">Template Variables</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use these placeholders in templates. They auto-fill when you select a booking.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['{{name}}', '{{team}}', '{{date}}', '{{event}}', '{{park}}', '{{phone}}', '{{email}}'].map(v => (
                      <div key={v} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-mono">{v}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AUTOMATION TAB */}
          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Send on Status Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure which template to send automatically when a booking's status changes. Messages are queued and sent within 1 minute.
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead className="w-24">Enabled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {BOOKING_STATUSES.map(status => {
                        const rule = getRuleForStatus(status);
                        return (
                          <TableRow key={status}>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{status.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={rule?.template_id || 'none'}
                                onValueChange={(val) =>
                                  upsertRuleMut.mutate({
                                    status,
                                    templateId: val === 'none' ? null : val,
                                    isActive: rule?.is_active ?? true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[250px]"><SelectValue placeholder="No template" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No template (disabled)</SelectItem>
                                  {templates?.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule?.is_active ?? false}
                                disabled={!rule?.template_id}
                                onCheckedChange={(checked) =>
                                  upsertRuleMut.mutate({
                                    status,
                                    templateId: rule?.template_id || null,
                                    isActive: checked,
                                  })
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Message Templates</CardTitle>
                <Button size="sm" onClick={openNewTemplate}>
                  <Plus className="h-4 w-4 mr-1" /> New Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Body</TableHead>
                        <TableHead className="w-24" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates?.map(tpl => (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">{tpl.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{tpl.category}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{tpl.body}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditTemplate(tpl)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteTplMut.mutate(tpl.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!templates || templates.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No templates yet</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle className="text-lg">Message History</CardTitle></CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
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
                              <Badge className={
                                log.status === 'sent' ? 'bg-primary/10 text-primary' :
                                log.status === 'queued' ? 'bg-accent/20 text-accent-foreground' :
                                'bg-destructive/20 text-destructive'
                              }>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.sent_by || '—'}</TableCell>
                          </TableRow>
                        ))}
                        {(!logs || logs.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No messages sent yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={tplDialog} onOpenChange={setTplDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tplEditId ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. Booking Confirmed" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={tplCategory} onValueChange={setTplCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea value={tplBody} onChange={e => setTplBody(e.target.value)} rows={4} placeholder="Hi {{name}}, your booking is confirmed..." />
              <p className="text-xs text-muted-foreground">
                Variables: {'{{name}}'}, {'{{team}}'}, {'{{date}}'}, {'{{event}}'}, {'{{park}}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplDialog(false)}>Cancel</Button>
            <Button onClick={() => saveTplMut.mutate()} disabled={!tplName || !tplBody || saveTplMut.isPending}>
              {saveTplMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
