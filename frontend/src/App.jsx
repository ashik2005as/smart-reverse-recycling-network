import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import BatteryHealth from './pages/BatteryHealth'
import SolarDegradation from './pages/SolarDegradation'
import RouteOptimizer from './pages/RouteOptimizer'
import MaterialRecovery from './pages/MaterialRecovery'
import Marketplace from './pages/Marketplace'
import GovDashboard from './pages/GovDashboard'
import DecisionEngine from './pages/DecisionEngine'
import DigitalPassport from './pages/DigitalPassport'
import FacilityLocator from './pages/FacilityLocator'
import ImpactCalculator from './pages/ImpactCalculator'
import Alerts from './pages/Alerts'

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/battery-health" element={<BatteryHealth />} />
            <Route path="/solar-degradation" element={<SolarDegradation />} />
            <Route path="/route-optimizer" element={<RouteOptimizer />} />
            <Route path="/material-recovery" element={<MaterialRecovery />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/gov-dashboard" element={<GovDashboard />} />
            <Route path="/decision-engine" element={<DecisionEngine />} />
            <Route path="/digital-passport" element={<DigitalPassport />} />
            <Route path="/facility-locator" element={<FacilityLocator />} />
            <Route path="/impact-calculator" element={<ImpactCalculator />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
