import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { mockEvents, mockParks } from '@/data/mockData';
import PublicLayout from '@/components/PublicLayout';
import { format } from 'date-fns';

const sportEmoji: Record<string, string> = { softball: '🥎', baseball: '⚾', soccer: '⚽' };
const sports = ['all', 'softball', 'baseball', 'soccer'] as const;
const eventTypes = ['all', 'tournament', 'league'] as const;

export default function Events() {
  const [sport, setSport] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  const filtered = mockEvents.filter(e => {
    if (!e.isActive) return false;
    if (sport !== 'all' && e.sport !== sport) return false;
    if (type !== 'all' && e.eventType !== type) return false;
    return true;
  });

  return (
    <PublicLayout>
      <div className="container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Upcoming Events</h1>
        <p className="text-muted-foreground mb-8">Find a tournament or league near you and book your setup.</p>

        {/* Sport tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sports.map(s => (
            <Button
              key={s}
              variant={sport === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSport(s)}
              className={sport === s ? 'bg-primary' : ''}
            >
              {s === 'all' ? '🏆 All Sports' : `${sportEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </Button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {eventTypes.map(t => (
            <Button
              key={t}
              variant={type === t ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setType(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏟️</p>
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try changing your filters or check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => {
              const park = mockParks.find(p => p.id === event.parkIds[0]);
              return (
                <Card key={event.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{sportEmoji[event.sport]}</span>
                      <Badge variant={event.eventType === 'tournament' ? 'default' : 'secondary'}>
                        {event.eventType}
                      </Badge>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2">{event.name}</h3>
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.startDate), 'MMM d')} – {format(new Date(event.endDate), 'MMM d, yyyy')}
                      </div>
                      {park && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {park.name}, {park.city}
                        </div>
                      )}
                    </div>
                    <Button asChild className="w-full bg-gradient-cta text-primary-foreground font-heading font-semibold">
                      <Link to={`/book?event=${event.id}`}>Book This Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
