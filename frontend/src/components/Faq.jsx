import { useState } from 'react'

import SectionHeading from './SectionHeading.jsx'
import { icons } from './icons.jsx'
import { faqs } from '../data/content.js'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="shell">
        <SectionHeading
          eyebrow="FAQ"
          title="The questions everyone asks first."
          body="Still curious after this? The repository is open, the issues are public, and the discussions are lively."
        />

        <div className="mx-auto mt-14 max-w-3xl">
          {faqs.map((item, index) => {
            const isOpen = index === openIndex

            return (
              <div
                key={item.q}
                className="reveal border-b border-ink-950/10 first:border-t first:border-ink-950/10"
                style={{ '--reveal-delay': `${index * 50}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={`font-display text-lg transition-colors sm:text-xl ${isOpen ? 'text-ink-950' : 'text-ink-950'}`}>
                    {item.q}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? 'rotate-180 border-ink-950/20 bg-cream-200 text-ink-950'
                        : 'border-ink-950/10 bg-white/70 text-ink-500'
                    }`}
                  >
                    <span className="h-4 w-4">{isOpen ? icons.minus : icons.plus}</span>
                  </span>
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <p className="min-h-0 pr-14 text-sm leading-relaxed text-ink-600 sm:text-base">{item.a}</p>
                </div>

                <div className="h-1" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
