import CallToAction from '../components/CallToAction.jsx'
import Faq from '../components/Faq.jsx'
import Features from '../components/Features.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/Hero.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Navbar from '../components/Navbar.jsx'
import OpenSource from '../components/OpenSource.jsx'
import Stats from '../components/Stats.jsx'
import { useReveal } from '../hooks/useReveal.js'

export default function Landing() {
  useReveal()

  return (
    <div className="relative min-h-screen overflow-x-clip bg-paper">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <OpenSource />
        <Faq />
        <CallToAction />
      </main>

      <Footer />
    </div>
  )
}
