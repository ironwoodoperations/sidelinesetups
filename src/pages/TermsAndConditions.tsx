import PublicLayout from '@/components/PublicLayout';

export default function TermsAndConditions() {
  return (
    <PublicLayout>
      <div className="container py-12 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 19, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Service Description</h2>
            <p>Sideline Setups provides equipment rental and setup services for youth sports events in East Texas. Our service includes delivery, setup, and teardown of shade tents, chairs, coolers, fans, and other equipment at designated sports venues.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Booking & Payment</h2>
            <p>All bookings must be made through our website and paid via PayPal at the time of booking. Prices are as listed at time of booking and include setup and teardown. Spot selections are approximate and may vary based on venue conditions.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Cancellation Policy</h2>
            <p>Cancellations made 24 or more hours before your event date will receive a full refund. Cancellations made within 24 hours of your event are subject to a 50% cancellation fee. No-shows will not be refunded.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Equipment Responsibility</h2>
            <p>While equipment is set up at your spot, you are responsible for its care. Intentional damage or theft of equipment will result in charges for repair or replacement at full retail value. Normal wear and weather-related issues are our responsibility.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Liability</h2>
            <p>Sideline Setups is not responsible for injuries sustained while using our equipment. Users assume all risk associated with the use of rented equipment. Our liability is limited to the amount paid for the booking.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Weather Policy</h2>
            <p>In the event of severe weather warnings (lightning, tornado, etc.), our crew may need to secure or remove equipment for safety. We will work with you to re-set up when conditions allow. No refunds are given for weather-related interruptions unless the entire event is cancelled.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
