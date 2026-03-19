import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import logoIcon from '@/assets/logo-icon.png';

const navLinks = [
  { label: 'Events', path: '/events' },
  { label: 'Packages', path: '/packages' },
  { label: 'My Bookings', path: '/my-bookings' },
  { label: 'FAQ', path: '/faq' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="Sideline Setups" className="h-8 w-8" />
          <span className="font-heading text-xl font-bold text-primary">
            Sideline <span className="text-accent">Setups</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === l.path ? 'text-accent' : 'text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild className="bg-gradient-cta text-primary-foreground hover:opacity-90 shadow-glow-amber font-heading font-semibold">
            <Link to="/book">Book Now</Link>
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-accent">
                <User className="h-4 w-4 inline mr-1" />{profile?.full_name || 'Account'}
              </Link>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/customer-login">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            {navLinks.map(l => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2 ${
                  location.pathname === l.path ? 'text-accent' : 'text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild className="bg-gradient-cta text-primary-foreground font-heading font-semibold w-full mt-2">
              <Link to="/book" onClick={() => setOpen(false)}>Book Now</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="" className="h-8 w-8 brightness-0 invert" />
              <span className="font-heading text-xl font-bold">
                Sideline <span className="text-accent">Setups</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              Your shade, chairs, and cooler — ready when you arrive. Serving East Texas youth sports families.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/events" className="hover:text-accent transition-colors">Events</Link>
              <Link to="/packages" className="hover:text-accent transition-colors">Packages</Link>
              <Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link>
              <Link to="/our-story" className="hover:text-accent transition-colors">Our Story</Link>
              <Link to="/book" className="hover:text-accent transition-colors">Book Now</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-accent transition-colors">Terms & Conditions</Link>
            </nav>
            <p className="text-xs text-primary-foreground/50 mt-6">
              © {new Date().getFullYear()} Sideline Setups. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
