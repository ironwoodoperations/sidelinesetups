import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tent, Armchair, Clock, Star, ChevronRight } from 'lucide-react';
import { usePackages } from '@/hooks/useSupabaseData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/PublicLayout';
import heroImage from '@/assets/hero-softball.jpg';

const howItWorks = [
  { icon: Tent, title: 'We Set Up & Tear Down', desc: 'Our crew arrives early, sets everything up at your chosen spot, and packs it all away when you leave.' },
  { icon: Armchair, title: 'Pro-Quality Gear', desc: 'Commercial-grade tents, padded chairs, coolers with ice, misting fans — no cheap popup tents here.' },
  { icon: Clock, title: 'Flexible Pricing', desc: 'Pay per game, per day, or the full weekend. Add extras like sidewalls, lights, or speakers à la carte.' },
];

const fallbackTestimonials = [
  { name: 'Sarah M.', team: 'Tyler Thunder 12U', quote: "Game changer! We showed up, everything was already set up. The kids loved the misting fan. We'll never go back to hauling our own stuff.", rating: 5 },
  { name: 'Coach Davis', team: 'East Texas Elite', quote: "I tell every parent on my team about Sideline Setups. The VIP Suite with the speaker made us the hangout spot all weekend.", rating: 5 },
  { name: 'Jessica R.', team: 'Longview Lightning', quote: "Worth every penny. Three tournaments in the Texas heat and we were the only ones actually comfortable. The crew was so friendly too!", rating: 5 },
];

export default function Index() {
  const { data: packages, isLoading } = usePackages();
  const topPackages = (packages || []).slice(0, 3);

  // Fetch real reviews from DB
  const { data: dbReviews } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, bookings(full_name, team_name)')
        .eq('is_visible', true)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const testimonials = (dbReviews && dbReviews.length >= 3)
    ? dbReviews.slice(0, 3).map(r => ({
        name: (r.bookings as any)?.full_name || 'Happy Customer',
        team: (r.bookings as any)?.team_name || '',
        quote: r.comment || 'Great experience!',
        rating: r.rating,
      }))
    : fallbackTestimonials;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative container py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
              Your shade, chairs, and cooler—
              <span className="text-accent">ready when you arrive.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg">
              Skip the packing, skip the sweat. Just show up, watch, and go home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold text-base">
                <Link to="/book">Book Now <ChevronRight className="ml-1 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-heading font-semibold text-base">
                <Link to="/events">Find an Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-foreground mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">Three simple steps to sideline comfort</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <Card key={i} className="shadow-card border-0 bg-card hover:shadow-elevated transition-shadow">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-20">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-foreground mb-4">Our Packages</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">Pick the comfort level that fits your family</p>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topPackages.map((pkg, i) => {
                const features = (pkg.features as string[] | null) || [];
                return (
                  <Card key={pkg.id} className={`shadow-card border-0 relative overflow-hidden ${i === 1 ? 'ring-2 ring-accent shadow-elevated' : ''}`}>
                    {i === 1 && (
                      <div className="absolute top-0 right-0 bg-gradient-cta text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg font-heading">MOST POPULAR</div>
                    )}
                    <CardContent className="pt-8 pb-6">
                      <h3 className="font-heading text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                      <div className="space-y-1 mb-6">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Per Game</span><span className="font-semibold text-foreground">${pkg.per_game_usd}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Full Day</span><span className="font-semibold text-foreground">${pkg.per_day_usd}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Full Weekend</span><span className="font-bold text-accent">${pkg.full_weekend_usd}</span></div>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-sm text-foreground">
                            <Star className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold">
                        <Link to={`/book?package=${pkg.id}`}>Book Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="font-heading"><Link to="/packages">View All Packages</Link></Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-navy text-primary-foreground">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">What Parents Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                <CardContent className="pt-6 pb-4">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, si) => <Star key={si} className="h-4 w-4 fill-accent text-accent" />)}</div>
                  <p className="text-sm text-primary-foreground/90 mb-4 italic">"{t.quote}"</p>
                  <div><p className="font-heading font-semibold text-sm">{t.name}</p><p className="text-xs text-primary-foreground/60">{t.team}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Stay Cool This Season?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Book your sideline setup in 2 minutes. We handle the rest.</p>
          <Button asChild size="lg" className="bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold text-base">
            <Link to="/book">Book Your Setup <ChevronRight className="ml-1 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
