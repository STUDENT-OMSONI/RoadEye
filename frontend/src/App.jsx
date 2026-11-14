import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AIDetection from './pages/AIDetection';
import Reports from './pages/Reports';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { api } from './services/api';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoadEyeLogo from './components/RoadEyeLogo';
import { Click3D } from './components/Motion3D';
import { Moon, Sun } from 'lucide-react';
import { WaterRippleCanvas } from './components/WaterEngine';
import { ScrollProgressBar, SmoothKineticScroll } from './components/SmoothScroll';

// Animated Route transitions with real 3D perspective depth and spring physics
function AnimatedRoutes({ backendStatus }) {
  const location = useLocation();

  return (
    <div style={{ perspective: 1400 }} className="w-full min-h-[calc(100vh-160px)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{
            opacity: 0,
            scale: 0.93,
            rotateX: 6,
            z: -80,
            y: 24,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
            z: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
            rotateX: -6,
            z: -100,
            y: -20,
          }}
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 24,
            mass: 0.8,
          }}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }}
          className="w-full"
        >
          <Routes location={location}>
            <Route path="/" element={<Dashboard backendStatus={backendStatus} />} />
            <Route path="/dashboard" element={<Dashboard backendStatus={backendStatus} />} />
            <Route path="/detection" element={<AIDetection backendStatus={backendStatus} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Dashboard backendStatus={backendStatus} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Opening Gateway: Displayed when the user is not yet logged in
function OpeningGateway() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-[#ea580c] selection:text-white overflow-x-hidden">
      {/* 1. Moving Background Video of Vehicles Driving on the Road */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="/videos/highway-drive.mp4"
      />

      {/* 2. Sleek Dark Vignette (NO heavy blur, so vehicles and road are sharp, moving & clearly visible) */}
      <div
        className={`fixed inset-0 transition-colors duration-500 z-0 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-b from-black/60 via-black/35 to-black/70'
            : 'bg-gradient-to-b from-black/45 via-black/25 to-black/55'
        }`}
      />

      {/* 3. Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        {/* Sleek Minimal Header */}
        <header className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black/60 border border-white/20 backdrop-blur-md shadow-2xl">
            <RoadEyeLogo
              size={26}
              textClass="text-lg sm:text-2xl font-black tracking-tight"
              darkBackground={true}
            />
          </div>
          <Click3D>
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center transition-all border border-white/20 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-2xl"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Moon size={16} className="text-amber-300" /> : <Sun size={16} className="text-amber-400" />}
            </button>
          </Click3D>
        </header>

        {/* Main Gateway Card with 3D Entrance */}
        <main style={{ perspective: 1200 }} className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotateX: 8, z: -70, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22, mass: 0.8 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full flex justify-center"
          >
            <Login />
          </motion.div>
        </main>

        {/* Minimal Gateway Footer */}
        <footer className="w-full py-3 sm:py-4 px-3 text-center text-[10px] sm:text-xs text-white/90 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          RoadEye Autonomous Pavement Safety System &bull; Civic Infrastructure Intelligence
        </footer>
      </div>
    </div>
  );
}

// Main App Layout matching modern smart-city dark & light SaaS design
function AppContent({ backendStatus, checkStatus }) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, show the opening Login gateway
  if (!isAuthenticated) {
    return <OpeningGateway />;
  }

  // Once authenticated, show full site with Navbar, main routes, and Footer
  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#ea580c] selection:text-white transition-colors duration-200 ${
        isDark ? 'bg-[#091119] text-slate-100' : 'bg-[#edf2f7] text-slate-900'
      }`}
    >
      {/* Floating Top Navbar */}
      <Navbar backendStatus={backendStatus} onRefreshStatus={checkStatus} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AnimatedRoutes backendStatus={backendStatus} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', model: 'YOLOv8 best.pt' });

  const checkStatus = async () => {
    try {
      const res = await api.checkHealth();
      setBackendStatus(res);
    } catch {
      setBackendStatus({ status: 'offline', model: 'best.pt' });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Global Smooth Kinetic Scrolling Engine */}
          <SmoothKineticScroll />

          {/* Top Luminous Scroll Reading Progress Beam */}
          <ScrollProgressBar />

          {/* Global 60FPS Fluid Water Animation Engine across all pages */}
          <WaterRippleCanvas />

          <AppContent backendStatus={backendStatus} checkStatus={checkStatus} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
