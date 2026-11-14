import React from 'react';
import { Link } from 'react-router-dom';
import {
  Linkedin,
  Instagram,
  Github,
  Twitter,
  Mail,
  ArrowUp
} from 'lucide-react';
import RoadEyeLogo from './RoadEyeLogo';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  // High-contrast inverted dual-mode styling:
  // Light Mode (canvas #edf2f7): Footer is DARK card (#13222e, white text)
  // Dark Mode (canvas #091119): Footer is LIGHT card (white, dark text)
  const footerBg = isDark
    ? 'bg-white border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#13222e] border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const headingColor = isDark ? 'text-slate-900 font-black' : 'text-white font-black';
  const descColor = isDark ? 'text-slate-600' : 'text-slate-300';
  const linkColor = isDark
    ? 'text-slate-600 hover:text-[#ea580c] transition-colors'
    : 'text-slate-300 hover:text-[#ea580c] transition-colors';

  const socialBtn = isDark
    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-white hover:bg-[#ea580c] hover:border-[#ea580c] shadow-sm'
    : 'bg-[#0f1d2a] border-slate-700/70 text-slate-300 hover:text-white hover:bg-[#ea580c] hover:border-[#ea580c] shadow-sm';

  const dividerColor = isDark ? 'border-slate-200' : 'border-slate-800';
  const copyrightColor = isDark ? 'text-slate-500' : 'text-slate-400';

  const backToTopBtn = isDark
    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
    : 'bg-[#0f1d2a] hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-white';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8 transition-colors duration-200">
      {/* Elevated Container */}
      <div className={`rounded-[28px] border p-8 sm:p-12 transition-colors duration-200 ${footerBg}`}>
        {/* Balanced 3-Section Grid (6 - 3 - 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Socials (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="inline-block group">
              <RoadEyeLogo
                size={34}
                textClass="text-2xl font-black tracking-tight"
                darkBackground={!isDark}
              />
            </Link>

            <p className={`text-xs sm:text-sm leading-relaxed ${descColor} max-w-md`}>
              AI-driven road surface inspection and automated pothole severity classification system. Delivering real-time telemetry, defect bounding boxes, and certified inspection audits for municipal infrastructure.
            </p>

            {/* Social & Professional Connect Links */}
            <div className="pt-2 space-y-2.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${copyrightColor}`}>
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${socialBtn}`}
                  title="Connect on LinkedIn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${socialBtn}`}
                  title="Follow on Instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${socialBtn}`}
                  title="View GitHub Repository"
                  aria-label="GitHub"
                >
                  <Github size={16} />
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${socialBtn}`}
                  title="Follow on Twitter / X"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>

                {/* Mail / Contact */}
                <a
                  href="mailto:contact@roadeye.ai"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${socialBtn}`}
                  title="Send Email Inquiry"
                  aria-label="Email Contact"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: PLATFORM (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className={`text-xs uppercase tracking-widest ${headingColor}`}>
              Platform
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link to="/detection?tab=image" className={`inline-block ${linkColor}`}>
                  Image Detection
                </Link>
              </li>
              <li>
                <Link to="/detection?tab=video" className={`inline-block ${linkColor}`}>
                  Video Analysis
                </Link>
              </li>
              <li>
                <Link to="/detection?tab=camera" className={`inline-block ${linkColor}`}>
                  Live Camera Feed
                </Link>
              </li>
              <li>
                <Link to="/reports" className={`inline-block ${linkColor}`}>
                  PDF Audit Reports
                </Link>
              </li>
              <li>
                <Link to="/detection" className={`inline-block ${linkColor}`}>
                  Severity Rating
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: NAVIGATION & RESOURCES (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className={`text-xs uppercase tracking-widest ${headingColor}`}>
              Navigation
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link to="/" className={`inline-block ${linkColor}`}>
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link to="/detection" className={`inline-block ${linkColor}`}>
                  Detection Hub
                </Link>
              </li>
              <li>
                <Link to="/reports" className={`inline-block ${linkColor}`}>
                  Inspection History
                </Link>
              </li>
              <li>
                <Link to="/about" className={`inline-block ${linkColor}`}>
                  About RoadEye
                </Link>
              </li>
              <li>
                <Link to="/profile" className={`inline-block ${linkColor}`}>
                  Inspector Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className={`inline-block ${linkColor}`}>
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${dividerColor}`}>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className={copyrightColor}>
              © 2026 <strong className={isDark ? 'text-slate-900' : 'text-white'}>RoadEye</strong>. All rights reserved.
            </p>
            <span className={`hidden sm:inline ${copyrightColor}`}>•</span>
            <span className={copyrightColor}>Autonomous Pavement Safety AI</span>
          </div>

          <button
            onClick={scrollToTop}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-200 active:scale-95 shadow-sm ${backToTopBtn}`}
            title="Scroll to Top"
          >
            <span>Back to top</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
