import PublicLayout from '@/components/PublicLayout';

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="container py-12 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 19, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Information We Collect</h2>
            <p>When you book a service through Sideline Setups, we collect your name, email address, phone number, team name, and payment information. We also collect location and event preference data to fulfill your booking.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">How We Use Your Information</h2>
            <p>We use your information to process bookings, communicate about your reservation (including SMS notifications if you opt in), improve our services, and send you updates about upcoming events. We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">SMS Communications</h2>
            <p>If you consent to SMS notifications, we will send you booking confirmations, setup notifications, and status updates. Message and data rates may apply. You can opt out at any time by replying STOP to any message.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Data Security</h2>
            <p>We use industry-standard encryption and secure servers to protect your personal and payment information. Payment processing is handled by PayPal and we do not store your full payment details on our servers.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-foreground">Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us at support@sidelinesetups.com.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
