export type FaqItem = { question: string; answer: string };

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export function FaqSection({
  items,
  id = "faq",
  title = "Perguntas frequentes",
}: {
  items: FaqItem[];
  id?: string;
  title?: string;
}) {
  return (
    <section id={id} className="container-premium py-16">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <details key={item.question} className="group rounded-xl border border-border bg-card p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium sm:text-base">
              {item.question}
              <span className="shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
      <FaqJsonLd items={items} />
    </section>
  );
}
