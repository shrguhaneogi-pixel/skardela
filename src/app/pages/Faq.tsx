import { text } from "../../text/en";

// ASD-STE100 Simplified Technical English comments.
// Frequently asked questions using accessible HTML disclosure elements.
const words = text.home.faq;

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="sk-surface-card my-8 p-6">
      <h2 id="faq-heading" className="text-xl font-bold mb-4">
        {words.heading}
      </h2>
      <div className="divide-y divide-stone-200 dark:divide-stone-800">
        {words.items.map((item) => (
          <details key={item.question} className="py-3 group">
            <summary className="font-semibold cursor-pointer text-stone-800 dark:text-stone-200 hover:text-orange-500 transition-colors list-none flex items-center justify-between">
              <span>{item.question}</span>
              <span className="text-stone-400 group-open:rotate-180 transition-transform duration-200">
                ↓
              </span>
            </summary>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {item.answer}
            </p>
            {item.link && (
              <p className="mt-2 text-sm">
                <a
                  href={item.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  {item.link.label}
                </a>
              </p>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
