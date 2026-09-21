import { REPO_URL } from '../config.js'
import { icons } from './icons.jsx'

const pillars = [
  {
    icon: 'lock',
    title: 'MIT, no asterisks',
    body: 'The generator, the renderer and every exporter are yours to fork, rebrand and ship commercially.',
  },
  {
    icon: 'server',
    title: 'Self-host in one command',
    body: 'A single container. Run it locally, behind a VPN, or fully air-gapped next to your own model gateway.',
  },
  {
    icon: 'terminal',
    title: 'Built to be scripted',
    body: 'A REST API and a CLI that behave the same way, so a build step can regenerate your deck on every commit.',
  },
]

export default function OpenSource() {
  return (
    <section id="open-source" className="relative py-20 sm:py-28">
      <div className="shell">
        <div className="reveal relative overflow-hidden rounded-[1.75rem] bg-ink-950 px-6 py-14 text-cream-100 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="animate-ember absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,253,248,0.07),transparent_65%)] blur-2xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,253,248,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,253,248,0.045)_1px,transparent_1px)] bg-[size:68px_68px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_72%)]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-cream-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cream-100" />
              Open source
            </span>

            <h2 className="mt-6 text-3xl leading-[1.1] text-cream-50 sm:text-4xl md:text-5xl">
              Own the pipeline, <span className="text-cream-400">not the subscription</span>.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-200/70">
              Presentations are how decisions get made. The tool that builds them should not be a black box you rent by
              the seat. Levitron is auditable, themeable and yours.
            </p>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-2xl bg-cream-50/14">
            <div className="grid gap-px sm:grid-cols-3">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="bg-ink-950 p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-50/12 bg-cream-50/6 text-cream-300">
                    <span className="h-5 w-5">{icons[pillar.icon]}</span>
                  </span>

                  <p className="mt-6 font-display text-base text-cream-50">{pillar.title}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-cream-200/65">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-light w-full sm:w-auto">
              <span className="h-4 w-4">{icons.star}</span>
              Star on GitHub
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="btn w-full border border-cream-50/20 text-cream-100 hover:border-cream-50/50 hover:text-cream-50 sm:w-auto"
            >
              View the source
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
