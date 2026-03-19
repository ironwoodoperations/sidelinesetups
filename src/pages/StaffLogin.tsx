import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';

export default function StaffLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin(p => p + d);
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const { data, error: err } = await supabase
      .from('employees')
      .select('*')
      .eq('pin', pin)
      .eq('is_active', true)
      .maybeSingle();
    setLoading(false);
    if (err || !data) {
      setError('Invalid PIN');
      setPin('');
      return;
    }
    sessionStorage.setItem('ss.staff', JSON.stringify({ id: data.id, name: data.full_name, role: data.role }));
    navigate('/staff');
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-elevated p-8 space-y-6">
        <div className="text-center space-y-2">
          <img src={logoIcon} alt="Sideline Setups" className="h-12 w-12 mx-auto" />
          <h1 className="font-heading text-xl font-bold text-foreground">Staff Login</h1>
          <p className="text-sm text-muted-foreground">Enter your PIN</p>
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-md border-2 flex items-center justify-center text-lg font-bold transition-colors ${
                i < pin.length ? 'border-accent bg-accent/10 text-foreground' : 'border-border bg-muted text-transparent'
              }`}
            >
              {i < pin.length ? '•' : '0'}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="grid grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-lg bg-muted hover:bg-muted/70 font-heading text-lg font-semibold text-foreground transition-colors"
            >
              {d}
            </button>
          ))}
          <button onClick={handleDelete} className="h-14 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground">
            <Delete className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-lg bg-muted hover:bg-muted/70 font-heading text-lg font-semibold text-foreground transition-colors"
          >
            0
          </button>
          <Button
            onClick={handleSubmit}
            disabled={pin.length < 4 || loading}
            className="h-14 bg-gradient-cta text-primary-foreground font-heading font-semibold"
          >
            {loading ? '...' : 'Go'}
          </Button>
        </div>
      </div>
    </div>
  );
}
