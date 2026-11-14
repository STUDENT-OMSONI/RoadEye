import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoadEyeLogo from './RoadEyeLogo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Click3D } from './Motion3D';
import { AetherLoop } from './MotionPlusEngine';

export default function Navbar({ backendStatus, onRefreshStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'DETECTION', path: '/detection' },
    { name: 'REPORTS', path: '/reports' },
    { name: 'ABOUT', path: '/about' },
    { name: 'PROFILE', path: '/profile' },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
      <div
        className={`relative z-40 rounded-2xl px-3.5 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-colors duration-200 ${
          isDark
            ? 'bg-white/95 border border-slate-200/90 shadow-2xl backdrop-blur-md text-slate-900'
            : 'bg-[#162838] border border-slate-700/60 shadow-xl text-white'
        }`}
      >
        {/* Left: Brand Logo (RoadEye) with AetherLoop zero-gravity float */}
        <AetherLoop amplitude={1.8} duration={4.5}>
          <Link to="/" className="flex items-center group">
            <RoadEyeLogo
              size={28}
              textClass="text-lg sm:text-2xl font-black tracking-tight"
              darkBackground={!isDark}
            />
          </Link>
        </AetherLoop>

        {/* Center: Desktop Navigation Links with 3D Click & Orange Underline */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs font-bold tracking-wider">
          {navLinks.map((item) => (
            <Click3D key={item.path} scaleDown={0.92} depth={-10} tiltX={-4}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1.5 transition-colors uppercase inline-block ${
                    isActive
                      ? `${isDark ? 'text-slate-900' : 'text-white'} font-extrabold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#ea580c] after:rounded-full after:shadow-[0_1px_6px_rgba(234,88,12,0.6)]`
                      : `${isDark ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`
                  }`
                }
              >
                {item.name}
              </NavLink>
            </Click3D>
          ))}
        </nav>

        {/* Right: Light/Dark Mode Toggle, Avatar 'O', Sign Out, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Theme Toggle Button with 3D click */}
          <Click3D scaleDown={0.88} depth={-12}>
            <button
              type="button"
              onClick={toggleTheme}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isDark
                  ? 'border border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  : 'border border-slate-700/80 bg-[#0f1d2a]/80 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
            </button>
          </Click3D>

          {/* Profile Avatar 'O' Circle with 3D click */}
          <Click3D scaleDown={0.88} depth={-12}>
            <Link
              to="/profile"
              className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                isDark
                  ? 'border-orange-500 bg-orange-50 text-orange-600 hover:border-orange-600'
                  : 'border-[#ea580c] bg-[#0f1d2a] text-[#ea580c] hover:border-orange-400'
              }`}
              title="Profile (O)"
            >
              O
            </Link>
          </Click3D>

          {/* Quick Sign Out Button with 3D click (hidden on tiny screens, inside drawer) */}
          <Click3D scaleDown={0.88} depth={-12}>
            <button
              type="button"
              onClick={logout}
              className={`hidden sm:flex h-8 w-8 rounded-full items-center justify-center transition-all shadow-sm ${
                isDark
                  ? 'border border-slate-200 bg-slate-100 text-slate-500 hover:text-rose-600 hover:border-rose-300'
                  : 'border border-slate-700/80 bg-[#0f1d2a]/80 text-slate-400 hover:text-rose-400 hover:border-rose-600'
              }`}
              title="Sign Out to Login Gateway"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </Click3D>

          {/* Mobile hamburger menu toggle */}
          <Click3D scaleDown={0.88} depth={-10}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </Click3D>
        </div>
      </div>

      {/* Mobile Drawer Navigation with smooth spring physics */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`md:hidden mt-2 border rounded-2xl p-3.5 space-y-1.5 shadow-2xl backdrop-blur-xl transition-colors ${
              isDark ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-[#162838]/95 border-slate-700/70 text-white'
            }`}
          >
            {navLinks.map((item) => (
              <Click3D key={item.path} fullWidth scaleDown={0.96} depth={-8}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors ${
                      isActive
                        ? 'bg-[#ea580c] text-white shadow-md shadow-orange-500/20'
                        : isDark
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </Click3D>
            ))}

            {/* Sign Out Button in Mobile Drawer */}
            <div className={`pt-2 border-t ${isDark ? 'border-slate-100' : 'border-slate-700/60'}`}>
              <Click3D fullWidth scaleDown={0.96} depth={-8}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors text-rose-500 hover:bg-rose-500/10"
                >
                  <span>Sign Out</span>
                  <LogOut size={15} />
                </button>
              </Click3D>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
