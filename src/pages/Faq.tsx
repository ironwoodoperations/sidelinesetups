import PublicLayout from '@/components/PublicLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockFaqItems } from '@/data/mockData';

export default function Faq() {
  const items = mockFaqItems.filter(f => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <PublicLayout>
      <div className="container py-12 max-w-2xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Got questions? We've got answers.</p>

        <Accordion type="single" collapsible className="space-y-2">
          {items.map(item => (
            <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
              <AccordionTrigger className="font-heading font-semibold text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PublicLayout>
  );
}
