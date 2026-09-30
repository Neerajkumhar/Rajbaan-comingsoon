import { Categories } from './components/Categories.jsx'
import { Enquiry } from './components/Enquiry.jsx'
import { Footer } from './components/Footer.jsx'
import { Hero } from './components/Hero.jsx'
import { Marquee } from './components/Marquee.jsx'
import { SpiceField } from './components/SpiceField.jsx'
import { TopBar } from './components/TopBar.jsx'
import { Trust } from './components/Trust.jsx'
import { WhatsAppFab } from './components/WhatsAppFab.jsx'
import { LanguageProvider } from './LanguageContext.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <SpiceField />
      <TopBar />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Categories />
        <Trust />
        <Enquiry />
      </main>
      <Footer />
      <WhatsAppFab />
    </LanguageProvider>
  )
}
