import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Check, Plus, Minus, ChevronRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import PublicLayout from '@/components/PublicLayout';
import SpotPicker from '@/components/SpotPicker';
import { supabase } from '@/integrations/supabase/client';
import { useEvents, usePackages, useParks, useFields, useSpots, useAddOns, useLocks } from '@/hooks/useSupabaseData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import fieldDiagram1 from '@/assets/field-diagram-1.jpg';
import fieldDiagram2 from '@/assets/field-diagram-2.jpg';

// Map field images for demo (in production these come from DB image_url)
const fieldImageFallback: Record<number, string> = { 0: fieldDiagram1, 1: fieldDiagram2, 3: fieldDiagram1 };

const modeLabels: Record<string, string> = { per_game: 'Per Game', day: 'Full Day', weekend: 'Full Weekend' };

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getPkgPrice(pkg: { per_game_usd: number | null; per_day_usd: number | null; full_weekend_usd: number | null }, mode: string): number {
  switch (mode) {
    case 'per_game': return Math.round((pkg.per_game_usd || 0) * 100);
    case 'day': return Math.round((pkg.per_day_usd || 0) * 100);
    case 'weekend': return Math.round((pkg.full_weekend_usd || 0) * 100);
    default: return 0;
  }
}

function getAoPrice(ao: { per_game_usd: number | null; per_day_usd: number | null; full_weekend_usd: number | null }, mode: string): number {
  switch (mode) {
    case 'per_game': return Math.round((ao.per_game_usd || 0) * 100);
    case 'day': return Math.round((ao.per_day_usd || 0) * 100);
    case 'weekend': return Math.round((ao.full_weekend_usd || 0) * 100);
    default: return 0;
  }
}

interface BookingForm {
  packageId: string;
  packageMode: string;
  addOns: { addOnId: string; qty: number }[];
  eventId: string;
  date: string;
  gameTimes: string[];
  parkId: string;
  fieldId: string;
  spotId: string;
  fullName: string;
  email: string;
  phone: string;
  teamName: string;
  coachName: string;
  notes: string;
  agreedToTerms: boolean;
  smsConsent: boolean;
  discountCode: string;
}

export default function Book() {
  const [params] = useSearchParams();
  const { user, profile } = useAuth();

  const [form, setForm] = useState<BookingForm>({
    packageId: params.get('package') || '',
    packageMode: 'per_game',
    addOns: [],
    eventId: params.get('event') || '',
    date: '',
    gameTimes: [''],
    parkId: '',
    fieldId: '',
    spotId: '',
    fullName: '',
    email: '',
    phone: '',
    teamName: '',
    coachName: '',
    notes: '',
    agreedToTerms: false,
    smsConsent: false,
    discountCode: '',
  });

  // Pre-fill from profile
  useEffect(() => {
    if (profile && !form.fullName && !form.email) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        email: prev.email || profile.email || '',
        phone: prev.phone || profile.phone || '',
        teamName: prev.teamName || profile.team_name || '',
        coachName: prev.coachName || profile.coach_name || '',
      }));
    }
  }, [profile]);

  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountSavings, setDiscountSavings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [squareCard, setSquareCard] = useState<any>(null);
  const squareCardRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<BookingForm>) => setForm(prev => ({ ...prev, ...partial }));

  // DB queries
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: allPackages, isLoading: pkgLoading } = usePackages();
  const { data: allParks } = useParks();
  const { data: fields } = useFields(form.parkId || undefined);
  const { data: spots } = useSpots(form.fieldId || undefined);
  const { data: allAddOns } = useAddOns();
  const { data: locks } = useLocks(form.date || undefined, form.fieldId || undefined);

  // Square settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings-square'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const squareAppId = (siteSettings as any)?.square_app_id || '';
  const squareLocationId = (siteSettings as any)?.square_location_id || '';
  const squareEnv = (siteSettings as any)?.square_environment || 'sandbox';

  // Load Square Web Payments SDK
  useEffect(() => {
    if (!squareAppId || squareReady) return;
    const scriptId = 'square-web-sdk';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = squareEnv === 'production'
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = () => setSquareReady(true);
    document.head.appendChild(script);
  }, [squareAppId, squareEnv, squareReady]);

  // Initialize Square card when SDK ready and container visible
  const initSquareCard = useCallback(async () => {
    if (!squareReady || squareCard || !squareAppId || !squareCardRef.current) return;
    try {
      const payments = (window as any).Square.payments(squareAppId, squareLocationId);
      const card = await payments.card();
      await card.attach(squareCardRef.current);
      setSquareCard(card);
    } catch (err) {
      console.error('Square card init error:', err);
    }
  }, [squareReady, squareCard, squareAppId, squareLocationId]);

  useEffect(() => {
    initSquareCard();
  }, [initSquareCard]);

  // Derived
  const selectedEvent = (events || []).find(e => e.id === form.eventId);
  const selectedPkg = (allPackages || []).find(p => p.id === form.packageId);
  const availableParks = selectedEvent
    ? (allParks || []).filter(p => ((selectedEvent.park_ids as string[]) || []).includes(p.id))
    : (allParks || []);
  const selectedField = (fields || []).find(f => f.id === form.fieldId);
  const availableAddOns = selectedPkg
    ? (allAddOns || []).filter(a => ((selectedPkg.add_on_ids as string[]) || []).includes(a.id))
    : [];
  const takenSpotIds = (locks || []).map(l => l.spot_id).filter(Boolean) as string[];

  // Provide field image fallback for demo
  const fieldForPicker = selectedField ? {
    ...selectedField,
    imageUrl: selectedField.image_url || '',
    maxLeagueSpots: selectedField.max_league_spots || 2,
    parkId: selectedField.park_id || '',
  } : null;

  // If field has no image_url, use local generated image based on index
  const fieldIndex = (fields || []).findIndex(f => f.id === form.fieldId);
  const fieldWithImage = fieldForPicker ? {
    ...fieldForPicker,
    imageUrl: fieldForPicker.imageUrl || fieldImageFallback[fieldIndex] || '',
  } : null;

  const spotsForPicker = (spots || []).map(s => ({
    id: s.id,
    fieldId: s.field_id || '',
    label: s.label,
    x: Number(s.x) || 50,
    y: Number(s.y) || 50,
  }));

  // Pricing
  const baseCents = selectedPkg ? getPkgPrice(selectedPkg, form.packageMode) : 0;
  const addOnCents = form.addOns.reduce((sum, ao) => {
    const addOn = (allAddOns || []).find(a => a.id === ao.addOnId);
    return sum + (addOn ? getAoPrice(addOn, form.packageMode) * ao.qty : 0);
  }, 0);
  const subtotal = baseCents + addOnCents;
  const totalCents = subtotal - discountSavings;

  // Step checks
  const step1Done = !!form.packageId;
  const step2Done = step1Done && !!form.packageMode;
  const step4Done = step2Done && !!form.date;
  const step5Done = step4Done && !!form.parkId && !!form.fieldId && !!form.spotId;
  const step6Done = step5Done && !!form.fullName && !!form.email && !!form.phone;
  const step7Done = step6Done && form.agreedToTerms;

  const getAddOnQty = (id: string) => form.addOns.find(a => a.addOnId === id)?.qty || 0;
  const setAddOnQty = (id: string, qty: number) => {
    if (qty <= 0) update({ addOns: form.addOns.filter(a => a.addOnId !== id) });
    else {
      const exists = form.addOns.find(a => a.addOnId === id);
      if (exists) update({ addOns: form.addOns.map(a => a.addOnId === id ? { ...a, qty } : a) });
      else update({ addOns: [...form.addOns, { addOnId: id, qty }] });
    }
  };

  const applyDiscount = async () => {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', form.discountCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) {
      toast.error('Invalid or expired discount code');
      setDiscountApplied(false);
      setDiscountSavings(0);
      return;
    }
    if (data.max_uses && (data.used_count || 0) >= data.max_uses) {
      toast.error('This code has reached its usage limit');
      return;
    }
    const savings = data.discount_type === 'percent'
      ? Math.round(subtotal * Number(data.discount_value) / 100)
      : Math.round(Number(data.discount_value) * 100);
    setDiscountSavings(savings);
    setDiscountApplied(true);
    toast.success(`Code applied! You save ${formatCurrency(savings)}`);
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      const selectedEvt = (events || []).find(e => e.id === form.eventId);

      // Create booking first (pending status)
      // Calculate loyalty points (1 point per dollar spent)
      const pointsEarned = Math.floor(totalCents / 100);

      const { data: bookingData, error: bookingError } = await supabase.from('bookings').insert({
        user_id: user?.id || null,
        full_name: form.fullName,
        contact_email: form.email,
        phone: form.phone,
        team_name: form.teamName || null,
        coach_name: form.coachName || null,
        event_id: form.eventId || null,
        event_type: selectedEvt?.event_type || null,
        sport: selectedEvt?.sport || null,
        date: form.date,
        game_times: form.gameTimes.filter(Boolean),
        park_id: form.parkId,
        field_id: form.fieldId,
        spot_id: form.spotId,
        package_id: form.packageId,
        package_mode: form.packageMode,
        add_ons: form.addOns,
        base_cents: baseCents,
        add_on_cents: addOnCents,
        total_cents: totalCents,
        discount_amount_cents: discountSavings,
        loyalty_points_earned: pointsEarned,
        agreed_to_terms: form.agreedToTerms,
        sms_consent_given: form.smsConsent,
        notes: form.notes || null,
        status: 'pending',
      }).select('id').single();
      if (bookingError) throw bookingError;

      // Award loyalty points to user profile
      if (user?.id && pointsEarned > 0) {
        await supabase.rpc('increment_loyalty_points' as any, { _user_id: user.id, _points: pointsEarned }).catch(() => {});
      }

      // If Square is configured and card tokenization available, process payment
      if (squareCard && squareAppId && squareLocationId && totalCents > 0) {
        const tokenResult = await squareCard.tokenize();
        if (tokenResult.status !== 'OK') {
          throw new Error(tokenResult.errors?.[0]?.message || 'Card tokenization failed');
        }

        const { data: payResult, error: payError } = await supabase.functions.invoke('create-square-payment', {
          body: {
            sourceId: tokenResult.token,
            amountCents: totalCents,
            currency: 'USD',
            bookingId: bookingData.id,
            locationId: squareLocationId,
            environment: squareEnv,
          },
        });

        if (payError) throw new Error(payError.message || 'Payment processing failed');
        if (payResult?.error) throw new Error(payResult.error);

        toast.success('Payment successful! Booking confirmed.');
      } else {
        toast.success('Booking created successfully!');
      }

      window.location.href = `/thank-you?b=${bookingData.id}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* Sticky progress */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['Package', 'Duration', 'Add-Ons', 'Schedule', 'Location', 'Info', 'Consent', 'Discount', 'Summary', 'Payment'].map((label, i) => {
              const stepNum = i + 1;
              const isDone = stepNum <= (step7Done ? 9 : step6Done ? 7 : step5Done ? 6 : step4Done ? 5 : step2Done ? 3 : step1Done ? 2 : 0);
              return (
                <div key={i} className="flex items-center shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isDone ? <Check className="h-3 w-3" /> : stepNum}
                  </div>
                  <span className={`ml-1 mr-2 hidden sm:inline ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  {i < 9 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Book Your Setup</h1>

        {/* Event selector */}
        {!form.eventId && (
          <section className="mb-10">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Select an Event <span className="text-xs text-muted-foreground font-normal">(optional)</span></h2>
            {eventsLoading ? <Skeleton className="h-32" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(events || []).map(event => (
                  <button key={event.id} onClick={() => update({ eventId: event.id, parkId: '', fieldId: '', spotId: '' })}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${form.eventId === event.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                    <p className="font-heading font-semibold text-foreground">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.sport} · {event.event_type}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 1: Package */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">1. Choose Your Package</h2>
          {pkgLoading ? <Skeleton className="h-32" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(allPackages || []).map(pkg => (
                <button key={pkg.id} onClick={() => update({ packageId: pkg.id, addOns: [] })}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${form.packageId === pkg.id ? 'border-accent bg-accent/5 shadow-card' : 'border-border hover:border-accent/50'}`}>
                  <h3 className="font-heading font-bold text-foreground mb-1">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{pkg.description}</p>
                  <p className="text-sm font-semibold text-accent">From ${pkg.per_game_usd}/game</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Step 2: Duration */}
        {step1Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">2. Select Duration</h2>
            <div className="flex flex-wrap gap-3">
              {(['per_game', 'day', 'weekend'] as const).map(mode => (
                <button key={mode} onClick={() => update({ packageMode: mode })}
                  className={`px-5 py-3 rounded-lg border-2 font-heading font-semibold text-sm transition-all ${form.packageMode === mode ? 'border-accent bg-accent/5 text-accent' : 'border-border text-foreground hover:border-accent/50'}`}>
                  {modeLabels[mode]}
                  {selectedPkg && <span className="block text-xs mt-0.5">{formatCurrency(getPkgPrice(selectedPkg, mode))}</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Add-Ons */}
        {step2Done && availableAddOns.length > 0 && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">3. Add-Ons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableAddOns.map(addOn => {
                const qty = getAddOnQty(addOn.id);
                return (
                  <Card key={addOn.id} className={`border-2 ${qty > 0 ? 'border-accent' : 'border-border'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div><h4 className="font-heading font-semibold text-foreground">{addOn.name}</h4><p className="text-xs text-muted-foreground">{addOn.description}</p></div>
                        <span className="text-sm font-semibold text-accent whitespace-nowrap ml-2">+{formatCurrency(getAoPrice(addOn, form.packageMode))}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setAddOnQty(addOn.id, qty - 1)} disabled={qty === 0}><Minus className="h-4 w-4" /></Button>
                        <span className="font-bold text-foreground w-6 text-center">{qty}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setAddOnQty(addOn.id, qty + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4: Schedule */}
        {step2Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">4. Schedule</h2>
            <div className="space-y-4 max-w-sm">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => update({ date: e.target.value })} /></div>
              <div>
                <Label>Game Time(s)</Label>
                {form.gameTimes.map((gt, i) => (
                  <div key={i} className="flex gap-2 mt-1">
                    <Input type="time" value={gt} onChange={e => { const t = [...form.gameTimes]; t[i] = e.target.value; update({ gameTimes: t }); }} />
                    {form.gameTimes.length > 1 && <Button variant="ghost" size="icon" onClick={() => update({ gameTimes: form.gameTimes.filter((_, j) => j !== i) })}><Minus className="h-4 w-4" /></Button>}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => update({ gameTimes: [...form.gameTimes, ''] })}><Plus className="h-4 w-4 mr-1" /> Add Time</Button>
              </div>
            </div>
          </section>
        )}

        {/* Step 5: Location */}
        {step4Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">5. Choose Your Location</h2>
            <div className="mb-4">
              <Label className="mb-2 block">Park</Label>
              <div className="flex flex-wrap gap-3">
                {availableParks.map(park => (
                  <button key={park.id} onClick={() => update({ parkId: park.id, fieldId: '', spotId: '' })}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.parkId === park.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                    {park.name}
                  </button>
                ))}
              </div>
            </div>
            {form.parkId && fields && (
              <div className="mb-4 animate-fade-in">
                <Label className="mb-2 block">Field</Label>
                <div className="flex flex-wrap gap-3">
                  {fields.map(field => (
                    <button key={field.id} onClick={() => update({ fieldId: field.id, spotId: '' })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.fieldId === field.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                      {field.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {fieldWithImage && spotsForPicker.length > 0 && (
              <div className="animate-fade-in">
                <SpotPicker
                  field={fieldWithImage}
                  spots={spotsForPicker}
                  takenSpotIds={takenSpotIds}
                  value={form.spotId}
                  onChange={spotId => update({ spotId })}
                />
              </div>
            )}
          </section>
        )}

        {/* Step 6: Info */}
        {step5Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">6. Your Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="sm:col-span-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={e => update({ fullName: e.target.value })} placeholder="Jane Smith" /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => update({ email: e.target.value })} placeholder="jane@example.com" /></div>
              <div><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} placeholder="(903) 555-1234" /></div>
              <div><Label>Team Name</Label><Input value={form.teamName} onChange={e => update({ teamName: e.target.value })} /></div>
              <div><Label>Coach Name</Label><Input value={form.coachName} onChange={e => update({ coachName: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Special Notes</Label>
                <textarea value={form.notes} onChange={e => update({ notes: e.target.value })}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                  placeholder="Anything we should know?" />
              </div>
            </div>
          </section>
        )}

        {/* Step 7: Consent */}
        {step6Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">7. Consent</h2>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={form.agreedToTerms} onCheckedChange={v => update({ agreedToTerms: v === true })} />
                <label htmlFor="terms" className="text-sm text-foreground leading-snug cursor-pointer">
                  I agree to the <Link to="/terms-and-conditions" target="_blank" className="text-accent underline">Terms & Conditions</Link> and <Link to="/privacy-policy" target="_blank" className="text-accent underline">Privacy Policy</Link> *
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="sms" checked={form.smsConsent} onCheckedChange={v => update({ smsConsent: v === true })} />
                <label htmlFor="sms" className="text-sm text-muted-foreground leading-snug cursor-pointer">I consent to receive SMS notifications about my booking. Message and data rates may apply. Reply STOP to unsubscribe.</label>
              </div>
            </div>
          </section>
        )}

        {/* Step 8: Discount */}
        {step7Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">8. Discount Code</h2>
            <div className="flex gap-2 max-w-sm">
              <Input value={form.discountCode} onChange={e => { update({ discountCode: e.target.value }); setDiscountApplied(false); setDiscountSavings(0); }} placeholder="Enter code" />
              <Button onClick={applyDiscount} variant="outline">Apply</Button>
            </div>
            {discountApplied && <p className="text-sm text-success font-semibold mt-2">✓ Code applied! You save {formatCurrency(discountSavings)}</p>}
          </section>
        )}

        {/* Step 9: Summary */}
        {step7Done && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">9. Order Summary</h2>
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2 text-foreground">{selectedPkg?.name} ({modeLabels[form.packageMode]})</td>
                      <td className="py-2 text-right font-semibold">{formatCurrency(baseCents)}</td>
                    </tr>
                    {form.addOns.map(ao => {
                      const addOn = (allAddOns || []).find(a => a.id === ao.addOnId);
                      if (!addOn) return null;
                      return (
                        <tr key={ao.addOnId} className="border-b border-border">
                          <td className="py-2 text-muted-foreground">{addOn.name} × {ao.qty}</td>
                          <td className="py-2 text-right">{formatCurrency(getAoPrice(addOn, form.packageMode) * ao.qty)}</td>
                        </tr>
                      );
                    })}
                    {discountSavings > 0 && (
                      <tr className="border-b border-border">
                        <td className="py-2 text-success">Discount ({form.discountCode})</td>
                        <td className="py-2 text-right text-success">-{formatCurrency(discountSavings)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr><td className="pt-4 font-heading font-bold text-lg text-foreground">Total</td><td className="pt-4 text-right font-heading font-bold text-lg text-accent">{formatCurrency(totalCents)}</td></tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Step 10: Payment */}
        {step7Done && (
          <section className="mb-16 animate-fade-in-up">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">10. Payment</h2>
            <Card className="border-2 border-border bg-secondary">
              <CardContent className="p-6">
                {squareAppId ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Enter your card details below to complete payment.</p>
                    <div ref={squareCardRef} className="mb-4 min-h-[50px]" />
                    {!squareReady && <p className="text-xs text-muted-foreground">Loading payment form…</p>}
                    <Button onClick={handleSubmitBooking} disabled={submitting || !squareCard}
                      className="w-full bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold">
                      {submitting ? 'Processing…' : `Pay ${formatCurrency(totalCents)}`}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">Payment is not yet configured. Submit your booking and pay later.</p>
                    <Button onClick={handleSubmitBooking} disabled={submitting}
                      className="bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold">
                      {submitting ? 'Submitting…' : 'Complete Booking'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Sticky price bar */}
      {step1Done && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground border-t border-primary z-50">
          <div className="container flex items-center justify-between py-3">
            <div className="text-sm">
              <span className="text-primary-foreground/70">Current Total:</span>
              <span className="ml-2 font-heading font-bold text-lg text-accent">{formatCurrency(totalCents)}</span>
            </div>
            {selectedPkg && <Badge className="bg-accent text-accent-foreground font-heading">{selectedPkg.name}</Badge>}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
