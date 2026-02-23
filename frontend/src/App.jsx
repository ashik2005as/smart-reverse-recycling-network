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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
