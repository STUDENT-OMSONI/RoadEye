import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Camera,
  FileCheck2,
  FileText,
  Car,
  Sparkles,
  Scan
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import TiltCard3D from '../components/TiltCard3D';
import { Click3D, Stagger3D, Item3D } from '../components/Motion3D';
import {
  AetherLoop,
  PrismForge,
  NebulaFrame,
  LuminaMotion,
} from '../components/MotionPlusEngine';

export default function About() {
  const { isDark } = useTheme();

  // Canvas Tokens (sitting directly on the canvas background: dark #091119 in dark mode, light #edf2f7 in light mode)
  const pageHeading = isDark ? 'text-white' : 'text-slate-900';
  const pageSubtitle = isDark ? 'text-slate-400' : 'text-slate-600';
  const pageDivider = isDark ? 'border-slate-800' : 'border-slate-300';

  // Card Tokens (INVERTED elevated dual-mode cards):
  // Light Mode (canvas #edf2f7): Card is DARK (#13222e), text inside is WHITE / slate-300
  // Dark Mode (canvas #091119): Card is LIGHT (white), text inside is DARK slate-900 / slate-600
  const cardBg = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#13222e] border border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const innerCard = isDark
    ? 'bg-slate-50 border border-slate-200/90 text-slate-900'
    : 'bg-[#0f1d2a] border border-slate-800 text-white';

  const cardHeading = isDark ? 'text-slate-900' : 'text-white';
  const cardDesc = isDark ? 'text-slate-600' : 'text-slate-300';

  return (
    <Stagger3D delay={0.07} className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* 1. Page Header (On Canvas) with AetherLoop */}
      <Item3D tiltOnHover={false}>
        <div className={`pb-4 border-b ${pageDivider} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <AetherLoop amplitude={2} duration={5}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/30 mb-2">
                <ShieldCheck size={14} />
                <span>Civic Road Safety Initiative</span>
              </div>
            </AetherLoop>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${pageHeading}`}>
              About RoadEye
            </h1>
            <p className={`text-xs sm:text-sm ${pageSubtitle} mt-1 font-medium`}>
              Making everyday commutes safer through automated road hazard intelligence and citizen reporting.
            </p>
          </div>
        </div>
      </Item3D>

      {/* 2. Mission Statement (NebulaFrame Breathing Rim & 3D Tilt) */}
      <NebulaFrame rounded="rounded-2xl">
        <TiltCard3D maxTilt={6}>
          <section className={`rounded-2xl p-6 sm:p-8 border transition-colors ${cardBg} space-y-4`}>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${cardHeading}`}>
              Safer Roads for Every Commuter
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${cardDesc}`}>
              Potholes are more than just a nuisance—they cause fatal two-wheeler accidents, severe vehicular breakdowns, and unbudgeted municipal delays.
            </p>
            <p className={`text-xs sm:text-sm leading-relaxed ${cardDesc}`}>
              <strong className={cardHeading}>RoadEye</strong> is designed for everyday citizens, motorists, and neighborhood communities. It turns any smartphone or dashboard camera into an instant road inspection scanner, providing clear photographic proof and severity assessments that you can directly submit to municipal authorities and highway contractors for faster road repairs.
            </p>
          </section>
        </TiltCard3D>
      </NebulaFrame>

      {/* 3. How Citizens Use RoadEye (3-Step Guide with PrismForge Sheen) */}
      <section className="space-y-4">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${pageHeading}`}>
            How It Works in 3 Simple Steps
          </h2>
          <p className={`text-xs ${pageSubtitle} mt-0.5 font-medium`}>
            No engineering expertise required—built for quick and intuitive everyday use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 1 */}
          <PrismForge className="rounded-2xl h-full">
            <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-colors h-full ${cardBg}`}>
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#ea580c] flex items-center justify-center font-bold">
                  <Camera size={20} />
                </div>
                <h3 className={`text-sm font-bold ${cardHeading}`}>
                  1. Snap or Record
                </h3>
                <p className={`text-xs leading-relaxed ${cardDesc}`}>
                  Take a photo of any broken road section, upload a dashcam clip, or point your phone camera while observing asphalt hazards.
                </p>
              </div>
            </div>
          </PrismForge>

          {/* Step 2 */}
          <PrismForge className="rounded-2xl h-full">
            <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-colors h-full ${cardBg}`}>
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#ea580c] flex items-center justify-center font-bold">
                  <Scan size={20} />
                </div>
                <h3 className={`text-sm font-bold ${cardHeading}`}>
                  2. Instant Scan
                </h3>
                <p className={`text-xs leading-relaxed ${cardDesc}`}>
                  Our vision engine immediately locates potholes, marks colored bounding boxes, and calculates severity as Low, Medium, or High Risk.
                </p>
              </div>
            </div>
          </PrismForge>

          {/* Step 3 */}
          <PrismForge className="rounded-2xl h-full">
            <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-colors h-full ${cardBg}`}>
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#ea580c] flex items-center justify-center font-bold">
                  <FileCheck2 size={20} />
                </div>
                <h3 className={`text-sm font-bold ${cardHeading}`}>
                  3. Download Proof
                </h3>
                <p className={`text-xs leading-relaxed ${cardDesc}`}>
                  Generate an official, tamper-evident PDF inspection report with timestamps and photographic evidence to submit to local civic authorities.
                </p>
              </div>
            </div>
          </PrismForge>
        </div>
      </section>

      {/* 4. Real-World Benefits for Civilians */}
      <section className="space-y-4">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${pageHeading}`}>
            Why Civilians Rely on RoadEye
          </h2>
          <p className={`text-xs ${pageSubtitle} mt-0.5 font-medium`}>
            Real-world protection for drivers, families, and neighborhood communities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Benefit 1 */}
          <div className={`rounded-2xl p-5 border transition-colors ${cardBg} space-y-2`}>
            <div className="flex items-center gap-2 text-emerald-500">
              <Car size={18} />
              <h3 className={`text-sm font-bold ${cardHeading}`}>Prevent Costly Vehicle Damage</h3>
            </div>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Avoid bent alloy rims, sudden tire blowouts, and broken shock absorbers by knowing road risk levels beforehand.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className={`rounded-2xl p-5 border transition-colors ${cardBg} space-y-2`}>
            <div className="flex items-center gap-2 text-[#ea580c]">
              <ShieldCheck size={18} />
              <h3 className={`text-sm font-bold ${cardHeading}`}>Protect Two-Wheelers & Cyclists</h3>
            </div>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Deep potholes are the #1 cause of sudden motorcycle skids and cyclist injuries. Identifying them helps protect vulnerable commuters.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className={`rounded-2xl p-5 border transition-colors ${cardBg} space-y-2`}>
            <div className="flex items-center gap-2 text-blue-500">
              <FileText size={18} />
              <h3 className={`text-sm font-bold ${cardHeading}`}>Undeniable Civic Proof</h3>
            </div>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Replace verbal complaints with certified, timestamped photo reports that municipal ward officers and road contractors cannot dismiss.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className={`rounded-2xl p-5 border transition-colors ${cardBg} space-y-2`}>
            <div className="flex items-center gap-2 text-amber-500">
              <Sparkles size={18} />
              <h3 className={`text-sm font-bold ${cardHeading}`}>100% Free & Accessible</h3>
            </div>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Works directly in your mobile or computer browser without downloading heavy software or requiring login credentials.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Simple Severity Guide */}
      <section className={`rounded-2xl p-6 sm:p-7 border transition-colors ${cardBg} space-y-4`}>
        <div>
          <h2 className={`text-base sm:text-lg font-bold tracking-tight ${cardHeading}`}>
            Understanding Pothole Hazard Levels
          </h2>
          <p className={`text-xs ${cardDesc} mt-0.5`}>
            How RoadEye classifies road surface danger for everyday drivers:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Low */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1.5`}>
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Low Risk</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${cardDesc}`}>
              Surface hairline cracking or shallow wear (&lt;2 cm). Safe for normal speeds; schedule for routine resurfacing.
            </p>
          </div>

          {/* Medium */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1.5`}>
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Medium Caution</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${cardDesc}`}>
              Visible potholes (2 to 5 cm deep). Causes vehicle vibration and tire wear. Drivers should slow down.
            </p>
          </div>

          {/* High */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1.5`}>
            <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>High Danger</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${cardDesc}`}>
              Deep asphalt craters (&gt;5 cm deep). Critical risk of tire blowouts, rim damage, or two-wheeler falls. Demands urgent patching.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className={`rounded-2xl p-6 sm:p-8 border transition-colors ${cardBg} flex flex-col sm:flex-row items-center justify-between gap-5`}>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className={`text-base sm:text-lg font-black tracking-tight ${cardHeading}`}>
            Spotted a dangerous road near you?
          </h3>
          <p className={`text-xs ${cardDesc}`}>
            Scan road imagery right now or download a PDF report to alert your local road department.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <LuminaMotion>
            <Link
              to="/detection"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-amber-600 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-bold px-5 py-2.5 transition-all shadow-md shadow-black/20"
            >
              <Scan size={15} />
              <span>Start Inspection</span>
            </Link>
          </LuminaMotion>

          <Click3D scaleDown={0.93} depth={-10} tiltX={-3}>
            <Link
              to="/reports"
              className={`inline-flex items-center gap-1.5 rounded-xl border text-xs font-semibold px-4 py-2.5 transition-colors ${
                isDark
                  ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                  : 'border-slate-700 bg-[#0f1d2a] text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>View Reports</span>
            </Link>
          </Click3D>
        </div>
      </section>
    </Stagger3D>
  );
}
