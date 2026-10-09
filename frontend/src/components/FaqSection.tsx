// Plain <details>/<summary> accordion — accessible and interactive with no
// client-side JS needed, so this stays a server component like the rest of
// PropertyListingPage. The FAQPage JSON-LD for this content is emitted by
// the caller (same pattern as ItemList/BreadcrumbList there), not here.
export default function FaqSection({
  title,
  faqs,
}: {
  title: string;
  faqs: { question: string; answer: string }[];
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="mb-6 font-heading text-2xl font-bold text-brand-primary">{title}</h2>
      <div className="divide-y divide-brand-text/10 border-y border-brand-text/10">
        {faqs.map((faq, index) => (
          <details key={index} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-semibold text-brand-primary">
              {faq.question}
              <span className="shrink-0 text-xl leading-none text-brand-primary/60 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-line text-brand-text">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
