import { useState } from 'react'
import { useScroll } from './hooks/useScroll'
import { useGeoLocation } from './hooks/useGeoLocation'
import { Nav } from './components/layout/Nav'
import { Hero } from './components/hero/Hero'
import { Destinations } from './components/destinations/Destinations'
import { SmartNavPanel } from './components/navigation/SmartNavPanel'
import { Features } from './components/features/Features'
import { MissionControl } from './components/mission-control/MissionControl'
import { Testimonials } from './components/testimonials/Testimonials'
import { CTA } from './components/cta/CTA'
import { Footer } from './components/layout/Footer'
import { AIPlannerModal } from './components/planner/AIPlannerModal'
import { SignInModal } from './components/auth/SignInModal'

import { TripFilters } from './types'

export default function App() {
  const scrolled = useScroll(20)
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [activeQuery, setActiveQuery] = useState('3 days couple trip in Kyoto with heritage & food')
  const [activeFilters, setActiveFilters] = useState<TripFilters>({
    travelerType: 'couple',
    days: 3,
    budgetTier: 'moderate',
    travelStyle: 'culture',
  })
  const geo = useGeoLocation()

  const handleOpenPlannerWithQuery = (query: string, filters?: Partial<TripFilters>) => {
    setActiveQuery(query)
    if (filters) {
      setActiveFilters((prev) => ({ ...prev, ...filters }))
    }
    setPlannerOpen(true)
  }


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white">
      {/* Fixed Header Bar */}
      <Nav
        scrolled={scrolled}
        onOpenPlanner={() => setPlannerOpen(true)}
        onOpenSignIn={() => setSignInOpen(true)}
      />

      {/* Main Page Sections */}
      <main>
        <Hero geo={geo} onPlanQuery={handleOpenPlannerWithQuery} />
        <Destinations
          userLat={geo.latitude}
          userLng={geo.longitude}
          userCity={geo.cityName}
          onGenerateItinerary={handleOpenPlannerWithQuery}
        />
        <SmartNavPanel userLat={geo.latitude} userLng={geo.longitude} userCity={geo.cityName} />
        <Features />
        <MissionControl />
        <Testimonials />
        <CTA onOpenPlanner={() => setPlannerOpen(true)} />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* AI Itinerary Planner Modal */}
      <AIPlannerModal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        initialQuery={activeQuery}
        initialFilters={activeFilters}
        userLat={geo.latitude}
        userLng={geo.longitude}
        userCity={geo.cityName}
        onUpdateCity={geo.setCustomLocation}
      />


      {/* Sign In / Sign Up Modal */}
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
      />
    </div>
  )
}
