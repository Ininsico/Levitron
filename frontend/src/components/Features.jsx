import SectionHeading from './SectionHeading.jsx'
import { icons } from './icons.jsx'
import { features } from '../data/content.js'

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Features"
          title="Everything between an idea and a finished deck."
          body="Levitron handles the part that eats your evening — structure, layout and export — so you can spend the time on the argument you are actually making."
        />

        <div className="card reveal mt-14 overflow-hidden bg-ash-950/12">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="group flex flex-col bg-cream-50 p-8 transition-colors duration-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-lava-500/20 bg-lava-50 text-lava-600 transition-colors duration-300 group-hover:border-lava-500 group-hover:bg-lava-500 group-hover:text-cream-50">
                    <span className="h-5 w-5">{icons[feature.icon]}</span>
                  </span>
                  <span className="font-mono text-xs tabular-nums text-ash-300 transition-colors duration-300 group-hover:text-lava-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-8 text-lg text-ash-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ash-600">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
