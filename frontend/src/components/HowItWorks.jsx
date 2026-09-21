import SectionHeading from './SectionHeading.jsx'
import { steps } from '../data/content.js'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(23,17,15,0.12),transparent)]" />

      <div className="shell">
        <SectionHeading
          eyebrow="How it works"
          title="Three moves, no slide wrangling."
          body="The workflow is deliberately short. Everything Levitron produces is editable source, never a locked binary."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div aria-hidden="true" className="hairline absolute left-0 right-0 top-9 hidden md:block" />

          {steps.map((item, index) => (
            <article key={item.step} className="reveal relative" style={{ '--reveal-delay': `${index * 120}ms` }}>
              <div className="flex items-center gap-4">
                <span className="relative z-10 flex h-18 w-18 shrink-0 items-center justify-center rounded-3xl border border-ink-950/12 bg-cream-50 font-display text-xl text-ink-950 shadow-soft">
                  {item.step}
                </span>
              </div>

              <h3 className="mt-6 text-xl text-ink-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
