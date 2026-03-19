import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function CustomerLogin() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    // Store phone in sessionStorage for lookup
    sessionStorage.setItem('ss.customer_phone', phone.trim());
    navigate('/my-bookings');
  };

  return (
    <PublicLayout>
      <div className="container py-16 max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">View My Bookings</h1>
          <p className="text-sm text-muted-foreground">Enter the phone number you used when booking to look up your reservations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(903) 555-1234"
              className="text-center text-lg"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold" disabled={!phone.trim()}>
            Find My Bookings
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          SMS-based OTP verification will be available when Twilio is connected. For now, bookings are looked up by phone number.
        </p>
      </div>
    </PublicLayout>
  );
}
