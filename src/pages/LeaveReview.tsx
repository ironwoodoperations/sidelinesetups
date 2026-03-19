import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import PublicLayout from '@/components/PublicLayout';

export default function LeaveReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const { user, loading: authLoading } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in first'); navigate('/customer-login'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId || null,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      toast.success('Thank you for your review!');
      navigate('/my-bookings');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <PublicLayout>
      <div className="container py-16 max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Leave a Review</h1>
          <p className="text-sm text-muted-foreground">We'd love to hear about your experience!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hover || rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience…"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-gradient-cta text-primary-foreground font-heading font-semibold"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </form>
      </div>
    </PublicLayout>
  );
}
