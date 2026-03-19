import PublicLayout from '@/components/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, MapPin } from 'lucide-react';

export default function OurStory() {
  return (
    <PublicLayout>
      <div className="container py-12 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h1>

        <div className="prose prose-slate max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Sideline Setups started with a simple frustration: hauling tents, chairs, coolers, and fans to a weekend
            softball tournament in the East Texas heat — only to spend 30 minutes setting up and tearing down every single time.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We thought, <em>"What if families could just show up and everything was already waiting for them?"</em>
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            So we built exactly that. Our crew arrives early, sets up pro-quality shade, seating, and cooling equipment
            right at your chosen spot. You show up, enjoy the games, cheer your heart out, and walk away. We handle teardown, too.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Based in Tyler, Texas, we serve youth sports families across East Texas — at tournaments, league games, and
            everything in between. We're parents too, and we know what it's like to want to focus on the game instead
            of logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card border-0">
            <CardContent className="pt-6 text-center">
              <Heart className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground mb-1">Family First</h3>
              <p className="text-sm text-muted-foreground">We're parents who get it. More watching, less hauling.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground mb-1">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Built by and for the East Texas youth sports community.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="pt-6 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-heading font-bold text-foreground mb-1">East Texas Proud</h3>
              <p className="text-sm text-muted-foreground">Tyler, Longview, and surrounding communities.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
