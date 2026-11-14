import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Cpu,
  FileText,
  Camera,
  Video,
  Radio,
  FileDown,
  Clock,
  Gauge,
  History,
  Scan,
  Building2,
  HardHat,
  GraduationCap,
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import TiltCard3D from '../components/TiltCard3D';
import { Click3D, Stagger3D, Item3D } from '../components/Motion3D';
import {
  MotionPulse3D,
  AetherLoop,
  PixelDrift,
  NebulaFrame,
  PrismForge,
  LuminaMotion,
} from '../components/MotionPlusEngine';
import { ScrollReveal } from '../components/SmoothScroll';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // High-contrast inverted dual-mode styling:
  // Dark mode (canvas #091119): Things in LIGHT (white cards, dark text, clean borders)
  // Light mode (canvas #edf2f7): Things in DARK (navy cards #13222e, white text)
  const cardBg = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#13222e] border border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const cardTitle = isDark ? 'text-slate-900 font-bold' : 'text-white font-bold';
  const cardDesc = isDark ? 'text-slate-600' : 'text-slate-300';
  const iconBox = isDark
    ? 'bg-orange-50 border border-orange-200 text-[#ea580c]'
    : 'bg-slate-800/80 border border-slate-700 text-[#ea580c]';
  const stepBadge = isDark
    ? 'bg-orange-100 text-[#ea580c] font-bold'
    : 'bg-[#ea580c]/15 text-[#ea580c] font-bold';

  const sectionTitle = isDark ? 'text-white' : 'text-slate-900';
  const sectionSubtitle = isDark ? 'text-slate-400' : 'text-slate-600';

  const capabilitiesStrip = isDark
    ? 'bg-white/95 border-t border-slate-200/90 text-slate-900 backdrop-blur-md'
    : 'bg-[#091119]/85 border-t border-slate-700/70 text-slate-100 backdrop-blur-md';
  const capabilitiesDivider = isDark ? 'bg-slate-300' : 'bg-slate-700/80';
  const capabilitiesText = isDark ? 'text-slate-800 hover:text-[#ea580c]' : 'text-slate-100 hover:text-[#ea580c]';

  const ctaSection = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#162838] border border-slate-700/60 text-white shadow-2xl shadow-slate-900/10';
  const ctaTitle = isDark ? 'text-slate-900' : 'text-white';
  const ctaDesc = isDark ? 'text-slate-600' : 'text-slate-300';

  const statLabel = isDark ? 'text-slate-500' : 'text-slate-400';
  const statValTotal = isDark ? 'text-slate-900' : 'text-white';
  const statSub = isDark ? 'text-slate-500' : 'text-slate-400';

  // LIVE STATS: Real backend data only, starts at 0
  const [stats, setStats] = useState({
    totalDetections: 0,
    potholesFound: 0,
    highSeverity: 0,
    reportsGenerated: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Fetch real stats from Flask backend
    api.getDashboardStats()
      .then((res) => {
        if (res && res.success) {
          setStats({
            totalDetections: res.totalDetections || 0,
            potholesFound: res.potholesFound || 0,
            highSeverity: res.highSeverity || 0,
            reportsGenerated: res.reportsGenerated || 0,
          });
        }
      })
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setStatsLoading(false));
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      if (typeof window !== 'undefined' && window.smoothScrollTo) {
        window.smoothScrollTo(el.offsetTop - 70);
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Stagger3D delay={0.09} className="space-y-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION with Moving Highway Video & Autonomous AI HUD Overlay */}
      {/* ========================================================================= */}
      <Item3D tiltOnHover={false}>
        <section className="relative rounded-[28px] overflow-hidden shadow-2xl min-h-[520px] sm:min-h-[560px] flex flex-col justify-between border border-slate-700/60 bg-[#142430] group">
          {/* Moving Scenic Highway Video with Fallback */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/hero-road.jpg"
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              src="/videos/highway-drive.mp4"
            />
            {/* Refined Gradient Overlay & Pixel Drift Studio Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b141d]/95 via-[#0c1824]/85 to-[#0b141d]/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b141d]/90 via-transparent to-[#0b141d]/30"></div>
            <PixelDrift count={14} color="#ea580c" accentColor="#38bdf8" />
          </div>

          {/* Content on top of dark overlay */}
          <div className="relative z-10 max-w-2xl p-5 sm:p-10 lg:p-14 space-y-4 sm:space-y-6">
            {/* Badge: ROADEYE PLATFORM with AetherLoop */}
            <AetherLoop amplitude={2.5} duration={5}>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/85 backdrop-blur-md border border-[#ea580c]/40 px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-[#ea580c] uppercase tracking-wider shadow-sm">
                <Eye size={13} className="text-[#ea580c]" />
                <span>ROADEYE 3D AI PLATFORM</span>
              </div>
            </AetherLoop>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-[1.08] font-sans">
              <span className="text-white block">Find potholes before</span>
              <span className="text-[#ea580c] block">they find your wheels.</span>
            </h1>

            {/* Subtitle text */}
            <p className="text-xs sm:text-base text-slate-200 font-normal max-w-xl leading-relaxed">
              Upload a photo or video, or go live with a camera. RoadEye inspects pavement surfaces in 3D, rates hazard severity with deep learning, and generates certified municipal reports.
            </p>

            {/* Action Buttons with LuminaMotion & 3D Clicks */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <LuminaMotion className="w-full sm:w-auto">
                <button
                  onClick={() => navigate('/detection')}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-amber-600 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs sm:text-sm px-7 py-3.5 transition-all shadow-md shadow-black/20"
                >
                  <Scan size={16} />
                  <span>Start Detection</span>
                </button>
              </LuminaMotion>

              <Click3D scaleDown={0.93} depth={-12} tiltX={-4} className="w-full sm:w-auto">
                <button
                  onClick={scrollToHowItWorks}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 font-medium text-xs sm:text-sm px-6 py-3.5 border border-slate-700/80 backdrop-blur-sm transition-colors"
                >
                  <span>See How It Works</span>
                </button>
              </Click3D>
            </div>
          </div>

          {/* Bottom Capabilities Strip with 3D Clicks (Scrollbar Completely Hidden) */}
          <div className={`relative z-10 w-full px-4 sm:px-10 py-3 overflow-hidden transition-colors duration-200 ${capabilitiesStrip}`}>
            <div
              className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 sm:gap-6 text-xs sm:text-sm scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {/* 1. Image Detection */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={() => navigate('/detection?tab=image')}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <ImageIcon size={18} className="text-[#ea580c]" />
                  <span>Image Detection</span>
                </div>
              </Click3D>

              <div className={`h-4 w-px shrink-0 ${capabilitiesDivider}`}></div>

              {/* 2. Video Analysis */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={() => navigate('/detection?tab=video')}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <Film size={18} className="text-[#ea580c]" />
                  <span>Video Analysis</span>
                </div>
              </Click3D>

              <div className={`h-4 w-px shrink-0 ${capabilitiesDivider}`}></div>

              {/* 3. Live Camera */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={() => navigate('/detection?tab=camera')}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <Video size={18} className="text-[#ea580c]" />
                  <span>Live Camera</span>
                </div>
              </Click3D>

              <div className={`h-4 w-px shrink-0 ${capabilitiesDivider}`}></div>

              {/* 4. Severity Rating */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={scrollToHowItWorks}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <Gauge size={18} className="text-[#ea580c]" />
                  <span>Severity Rating</span>
                </div>
              </Click3D>

              <div className={`h-4 w-px shrink-0 ${capabilitiesDivider}`}></div>

              {/* 5. PDF Reports */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={() => navigate('/reports')}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <FileText size={18} className="text-[#ea580c]" />
                  <span>PDF Reports</span>
                </div>
              </Click3D>

              <div className={`h-4 w-px shrink-0 ${capabilitiesDivider}`}></div>

              {/* 6. Scan History */}
              <Click3D scaleDown={0.92} depth={-8}>
                <div
                  onClick={() => navigate('/reports')}
                  className={`flex items-center gap-2.5 font-bold transition-colors cursor-pointer shrink-0 ${capabilitiesText}`}
                >
                  <Clock size={18} className="text-[#ea580c]" />
                  <span>Scan History</span>
                </div>
              </Click3D>
            </div>
          </div>
        </section>
      </Item3D>

      {/* ========================================================================= */}
      {/* 2. HOW IT WORKS (3 steps with PrismForge Dynamic Specular Sheen & 3D Tilt) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <section id="how-it-works" className="space-y-6 scroll-mt-20">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${sectionTitle}`}>
                How It Works
              </h2>
              <p className={`text-xs sm:text-sm ${sectionSubtitle} mt-1 font-medium`}>
                From road capture to certified repair audit in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 01 */}
              <PrismForge className="rounded-2xl h-full">
                <TiltCard3D maxTilt={10}>
                  <div className={`rounded-2xl ${cardBg} p-7 border shadow-sm flex flex-col justify-between h-full hover:border-[#ea580c]/50 transition-colors`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${stepBadge}`}>
                          STEP 01
                        </span>
                        <div className={`h-10 w-10 rounded-xl ${iconBox} border flex items-center justify-center`}>
                          <UploadCloud size={20} />
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold ${cardTitle}`}>01 Upload</h3>
                      <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                        Add a road image, video or connect your camera stream.
                      </p>
                    </div>
                  </div>
                </TiltCard3D>
              </PrismForge>

              {/* Step 02 */}
              <PrismForge className="rounded-2xl h-full">
                <TiltCard3D maxTilt={10}>
                  <div className={`rounded-2xl ${cardBg} p-7 border shadow-sm flex flex-col justify-between h-full hover:border-[#ea580c]/50 transition-colors`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${stepBadge}`}>
                          STEP 02
                        </span>
                        <div className={`h-10 w-10 rounded-xl ${iconBox} border flex items-center justify-center`}>
                          <Cpu size={20} />
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold ${cardTitle}`}>02 Detect</h3>
                      <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                        Our custom YOLOv8 model locates and segments each road defect.
                      </p>
                    </div>
                  </div>
                </TiltCard3D>
              </PrismForge>

              {/* Step 03 */}
              <PrismForge className="rounded-2xl h-full">
                <TiltCard3D maxTilt={10}>
                  <div className={`rounded-2xl ${cardBg} p-7 border shadow-sm flex flex-col justify-between h-full hover:border-[#ea580c]/50 transition-colors`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${stepBadge}`}>
                          STEP 03
                        </span>
                        <div className={`h-10 w-10 rounded-xl ${iconBox} border flex items-center justify-center`}>
                          <FileText size={20} />
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold ${cardTitle}`}>03 Report</h3>
                      <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                        Calculate severity, confidence scores and export certified PDF reports.
                      </p>
                    </div>
                  </div>
                </TiltCard3D>
              </PrismForge>
            </div>
          </section>
        </Item3D>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 3. CORE FEATURES (4 cards with NebulaFrame Breathing Rims & 3D Tilt) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <section className="space-y-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${sectionTitle}`}>
                Core Features
              </h2>
              <p className={`text-xs sm:text-sm ${sectionSubtitle} mt-1 font-medium`}>
                Specialized computer vision tools designed for municipal road monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Feature 1: Image Detection */}
              <NebulaFrame rounded="rounded-2xl" className="h-full">
                <TiltCard3D
                  maxTilt={12}
                  onClick={() => navigate('/detection?tab=image')}
                >
                  <div className={`rounded-2xl ${cardBg} p-6 border shadow-sm hover:border-[#ea580c]/60 transition-colors cursor-pointer group flex flex-col justify-between h-full`}>
                    <div className="space-y-3">
                      <div className={`h-11 w-11 rounded-xl ${iconBox} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Camera size={22} />
                      </div>
                      <h3 className={`text-base font-bold ${cardTitle}`}>Image Detection</h3>
                      <p className={`text-xs ${cardDesc} leading-relaxed`}>
                        Analyze a single road photo in sub-second inference.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-bold text-[#ea580c] gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Open Tool</span> <ArrowRight size={13} />
                    </div>
                  </div>
                </TiltCard3D>
              </NebulaFrame>

              {/* Feature 2: Video Analysis */}
              <NebulaFrame rounded="rounded-2xl" className="h-full">
                <TiltCard3D
                  maxTilt={12}
                  onClick={() => navigate('/detection?tab=video')}
                >
                  <div className={`rounded-2xl ${cardBg} p-6 border shadow-sm hover:border-[#ea580c]/60 transition-colors cursor-pointer group flex flex-col justify-between h-full`}>
                    <div className="space-y-3">
                      <div className={`h-11 w-11 rounded-xl ${iconBox} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Video size={22} />
                      </div>
                      <h3 className={`text-base font-bold ${cardTitle}`}>Video Analysis</h3>
                      <p className={`text-xs ${cardDesc} leading-relaxed`}>
                        Scan patrol recordings frame by frame with trajectory metrics.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-bold text-[#ea580c] gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Open Tool</span> <ArrowRight size={13} />
                    </div>
                  </div>
                </TiltCard3D>
              </NebulaFrame>

              {/* Feature 3: Live Camera */}
              <NebulaFrame rounded="rounded-2xl" className="h-full">
                <TiltCard3D
                  maxTilt={12}
                  onClick={() => navigate('/detection?tab=camera')}
                >
                  <div className={`rounded-2xl ${cardBg} p-6 border shadow-sm hover:border-[#ea580c]/60 transition-colors cursor-pointer group flex flex-col justify-between h-full`}>
                    <div className="space-y-3">
                      <div className={`h-11 w-11 rounded-xl ${iconBox} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Radio size={22} />
                      </div>
                      <h3 className={`text-base font-bold ${cardTitle}`}>Live Camera</h3>
                      <p className={`text-xs ${cardDesc} leading-relaxed`}>
                        Inspect pavement in real time from dashcams and mobile webcams.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-bold text-[#ea580c] gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Open Tool</span> <ArrowRight size={13} />
                    </div>
                  </div>
                </TiltCard3D>
              </NebulaFrame>

              {/* Feature 4: PDF Reports */}
              <NebulaFrame rounded="rounded-2xl" className="h-full">
                <TiltCard3D
                  maxTilt={12}
                  onClick={() => navigate('/reports')}
                >
                  <div className={`rounded-2xl ${cardBg} p-6 border shadow-sm hover:border-[#ea580c]/60 transition-colors cursor-pointer group flex flex-col justify-between h-full`}>
                    <div className="space-y-3">
                      <div className={`h-11 w-11 rounded-xl ${iconBox} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FileDown size={22} />
                      </div>
                      <h3 className={`text-base font-bold ${cardTitle}`}>PDF Reports</h3>
                      <p className={`text-xs ${cardDesc} leading-relaxed`}>
                        Generate certified, formatted municipal repair logs instantly.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-bold text-[#ea580c] gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>View Reports</span> <ArrowRight size={13} />
                    </div>
                  </div>
                </TiltCard3D>
              </NebulaFrame>
            </div>
          </section>
        </Item3D>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 4. WHY ROADEYE (PrismForge Dynamic Specular Sheen & 3D Tilt) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <section className="space-y-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${sectionTitle}`}>
                Why RoadEye
              </h2>
              <p className={`text-xs sm:text-sm ${sectionSubtitle} mt-1 font-medium`}>
                Objective, automated inspection replacing subjective and slow manual drives.
              </p>
            </div>

            <PrismForge className="rounded-[28px]">
              <TiltCard3D maxTilt={6}>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${cardBg} rounded-[28px] p-6 sm:p-10 border shadow-2xl`}>
                  {/* Photo Left with rounded corners & fallback */}
                  <div className="rounded-2xl overflow-hidden shadow-sm bg-slate-900 max-h-[360px] relative border border-slate-700">
                    <img
                      src="/images/pothole-detection-preview.jpg"
                      alt="AI Pothole Detection Preview"
                      loading="lazy"
                      className="w-full h-56 sm:h-[360px] object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hero-road.jpg';
                      }}
                    />
                  </div>

                  {/* 3 Points Right */}
                  <div className="space-y-6">
                    {/* Point 1 */}
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 shrink-0 rounded-xl ${iconBox} flex items-center justify-center mt-1 border`}>
                        <Clock size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-base font-bold ${cardTitle}`}>
                          Faster than manual surveys
                        </h3>
                        <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                          Automated computer vision scans frames in sub-second inference, reducing survey turnaround from days to minutes.
                        </p>
                      </div>
                    </div>

                    {/* Point 2 */}
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 shrink-0 rounded-xl ${iconBox} flex items-center justify-center mt-1 border`}>
                        <Gauge size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-base font-bold ${cardTitle}`}>
                          Consistent severity rating: Low, Medium, High
                        </h3>
                        <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                          Standardized pixel bounding box calculations and model confidence scores eliminate human subjectivity.
                        </p>
                      </div>
                    </div>

                    {/* Point 3 */}
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 shrink-0 rounded-xl ${iconBox} flex items-center justify-center mt-1 border`}>
                        <History size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-base font-bold ${cardTitle}`}>
                          Every scan saved in your history
                        </h3>
                        <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                          All past inspections, detected coordinates, and generated PDF files remain accessible for historical tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </PrismForge>
          </section>
        </Item3D>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 5. WHO IT'S FOR (3 small cards with 3D Tilt) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <section className="space-y-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${sectionTitle}`}>
                Who It's For
              </h2>
              <p className={`text-xs sm:text-sm ${sectionSubtitle} mt-1 font-medium`}>
                Designed for engineers, contractors, and academic researchers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Municipal Engineers */}
              <TiltCard3D maxTilt={10}>
                <div className={`rounded-2xl overflow-hidden ${cardBg} border shadow-sm flex flex-col justify-between h-full hover:shadow-xl transition-shadow`}>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src="/images/municipal-engineers.jpg"
                      alt="Municipal Engineers"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hero-road.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                      <Building2 size={18} className="text-[#ea580c]" />
                      <h3 className="text-base font-bold">Municipal Engineers</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                      Prioritize hazardous asphalt sectors, generate municipal repair logs, and allocate road repair budgets objectively.
                    </p>
                  </div>
                </div>
              </TiltCard3D>

              {/* Card 2: Road Contractors */}
              <TiltCard3D maxTilt={10}>
                <div className={`rounded-2xl overflow-hidden ${cardBg} border shadow-sm flex flex-col justify-between h-full hover:shadow-xl transition-shadow`}>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src="/images/road-contractors.jpg"
                      alt="Road Contractors"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hero-road.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                      <HardHat size={18} className="text-[#ea580c]" />
                      <h3 className="text-base font-bold">Road Contractors</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                      Document pavement conditions before and after resurfacing projects with verifiable, downloadable PDF reports.
                    </p>
                  </div>
                </div>
              </TiltCard3D>

              {/* Card 3: Students and Researchers */}
              <TiltCard3D maxTilt={10}>
                <div className={`rounded-2xl overflow-hidden ${cardBg} border shadow-sm flex flex-col justify-between h-full hover:shadow-xl transition-shadow`}>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src="/images/students-researchers.jpg"
                      alt="Students and Researchers"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hero-road.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                      <GraduationCap size={18} className="text-[#ea580c]" />
                      <h3 className="text-base font-bold">Students & Researchers</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className={`text-xs sm:text-sm ${cardDesc} leading-relaxed`}>
                      Benchmark custom YOLO convolutional neural networks against real-world pavement degradation footage.
                    </p>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </section>
        </Item3D>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 6. LIVE STATS (4 cards with MotionPulse3D) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <section className="space-y-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${sectionTitle}`}>
                Live System Statistics
              </h2>
              <p className={`text-xs sm:text-sm ${sectionSubtitle} mt-1 font-medium`}>
                Live counts calculated from your backend model logs (starts at zero).
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Stat 1: Total Scans */}
              <MotionPulse3D pulseScale={1.018} pulseSpeed={4.2} depth={-10}>
                <div className={`rounded-2xl ${cardBg} p-3.5 sm:p-6 border shadow-sm h-full`}>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statLabel} block`}>
                    Total Scans
                  </span>
                  <span className={`text-2xl sm:text-3xl font-black ${statValTotal} mt-1 block`}>
                    {statsLoading ? '0' : stats.totalDetections}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] ${statSub} mt-1 block`}>Completed surveys</span>
                </div>
              </MotionPulse3D>

              {/* Stat 2: Potholes Found */}
              <MotionPulse3D pulseScale={1.02} pulseSpeed={3.8} depth={-10}>
                <div className={`rounded-2xl ${cardBg} p-3.5 sm:p-6 border shadow-sm h-full`}>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statLabel} block`}>
                    Potholes Found
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#ea580c] mt-1 block">
                    {statsLoading ? '0' : stats.potholesFound}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] ${statSub} mt-1 block`}>YOLOv8 detected defects</span>
                </div>
              </MotionPulse3D>

              {/* Stat 3: High Severity */}
              <MotionPulse3D pulseScale={1.02} pulseSpeed={3.4} depth={-10}>
                <div className={`rounded-2xl ${cardBg} p-3.5 sm:p-6 border shadow-sm h-full`}>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statLabel} block`}>
                    High Severity
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-red-500 mt-1 block">
                    {statsLoading ? '0' : stats.highSeverity}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] ${statSub} mt-1 block`}>Priority road repairs</span>
                </div>
              </MotionPulse3D>

              {/* Stat 4: Reports */}
              <MotionPulse3D pulseScale={1.018} pulseSpeed={4.6} depth={-10}>
                <div className={`rounded-2xl ${cardBg} p-3.5 sm:p-6 border shadow-sm h-full`}>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statLabel} block`}>
                    Reports Generated
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 block">
                    {statsLoading ? '0' : stats.reportsGenerated}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] ${statSub} mt-1 block`}>Archived audit files</span>
                </div>
              </MotionPulse3D>
            </div>
          </section>
        </Item3D>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 7. FINAL CTA BANNER (with PixelDrift, LuminaMotion & 3D Tilt) */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={40}>
        <Item3D tiltOnHover={false}>
          <TiltCard3D maxTilt={5}>
            <section className={`rounded-[28px] ${ctaSection} p-6 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 relative overflow-hidden transition-colors duration-200`}>
              {/* PixelDrift Studio Particle Atmosphere */}
              <PixelDrift count={10} color="#ea580c" accentColor="#38bdf8" />

              <div className="relative z-10 space-y-2 text-center sm:text-left">
                <h2 className={`text-xl sm:text-3xl lg:text-4xl font-black tracking-tight ${ctaTitle}`}>
                  Ready to inspect your first road?
                </h2>
                <p className={`text-xs sm:text-sm ${ctaDesc} max-w-lg leading-relaxed`}>
                  Upload road imagery, assess pavement damage with deep learning, and produce certified municipal reports.
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full sm:w-auto">
                <LuminaMotion fullWidth={false} className="w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/detection')}
                    className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-amber-600 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs sm:text-sm px-8 py-3.5 sm:py-4 transition-all shadow-md shadow-black/20"
                  >
                    <Scan size={18} />
                    <span>Start Detection</span>
                  </button>
                </LuminaMotion>
              </div>
            </section>
          </TiltCard3D>
        </Item3D>
      </ScrollReveal>
    </Stagger3D>
  );
}
