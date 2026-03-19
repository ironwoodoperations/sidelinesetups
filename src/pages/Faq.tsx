import PublicLayout from '@/components/PublicLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useFaqItems } from '@/hooks/useSupabaseData';

export default function Faq() {
  const { data: items, isLoading } = useFaqItems();

  return (
    <PublicLayout>
      <div className="container py-12 max-w-2xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Got questions? We've got answers.</p>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {(items || []).map(item => (
              <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                <AccordionTrigger className="font-heading font-semibold text-foreground hover:no-underline">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </PublicLayout>
  );
}
