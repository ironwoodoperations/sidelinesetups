import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { mockPackages, mockAddOns } from '@/data/mockData';
import PublicLayout from '@/components/PublicLayout';

export default function Packages() {
  const packages = mockPackages.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <PublicLayout>
      <div className="container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Our Packages</h1>
        <p className="text-muted-foreground mb-8">Choose the comfort level that fits your crew. Every package includes setup and teardown.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, i) => {
            const addOns = mockAddOns.filter(a => pkg.addOnIds.includes(a.id));
            return (
              <Card
                key={pkg.id}
                className={`shadow-card border-0 relative overflow-hidden ${i === 1 ? 'ring-2 ring-accent shadow-elevated' : ''}`}
              >
                {i === 1 && (
                  <div className="absolute top-0 right-0 bg-gradient-cta text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg font-heading">
                    MOST POPULAR
                  </div>
                )}
                <CardContent className="pt-8 pb-6">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{pkg.description}</p>

                  <div className="bg-secondary rounded-lg p-4 mb-5">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Per Game</span>
                      <span className="font-semibold">${pkg.perGameUsd}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Full Day</span>
                      <span className="font-semibold">${pkg.perDayUsd}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Full Weekend</span>
                      <span className="font-bold text-accent">${pkg.fullWeekendUsd}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {pkg.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-foreground">
                        <Star className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {addOns.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Available Add-Ons</p>
                      <div className="flex flex-wrap gap-1">
                        {addOns.map(a => (
                          <span key={a.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="w-full bg-gradient-cta text-primary-foreground shadow-glow-amber font-heading font-semibold">
                    <Link to={`/book?package=${pkg.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
