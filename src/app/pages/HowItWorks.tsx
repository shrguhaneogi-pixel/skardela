import { text } from "../../text/en";

// ASD-STE100 Simplified Technical English comments.
// Three steps explaining the puzzle gameplay loop.
const words = text.home.steps;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="sk-surface-card my-8 p-6"
    >
      <h2 id="how-it-works-heading" className="text-xl font-bold mb-4">
        {words.heading}
      </h2>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
        {words.items.map((step, index) => (
          <li
            key={step.title}
            className="p-4 rounded-xl bg-stone-100/60 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700"
          >
            <span className="inline-block text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              Step {index + 1}
            </span>
            <h3 className="text-base font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
