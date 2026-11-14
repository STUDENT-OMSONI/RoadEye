import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  ShieldCheck,
  CheckCircle2,
  Activity,
  History,
  Scan,
  FileText,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TiltCard3D from '../components/TiltCard3D';
import { Click3D, Stagger3D, Item3D } from '../components/Motion3D';

export default function Profile() {
  const { isDark } = useTheme();
  const { logout } = useAuth();

  // Canvas Tokens (sitting directly on page canvas background)
  const pageHeading = isDark ? 'text-white' : 'text-slate-900';
  const pageSubtitle = isDark ? 'text-slate-400' : 'text-slate-600';
  const pageDivider = isDark ? 'border-slate-800' : 'border-slate-300';

  // Card Tokens (INVERTED elevated dual-mode cards):
  // Light Mode (canvas #edf2f7): Card is DARK (#13222e), text is WHITE
  // Dark Mode (canvas #091119): Card is LIGHT (white), text is DARK
  const cardBg = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#13222e] border border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const innerCard = isDark
    ? 'bg-slate-50 border border-slate-200/90 text-slate-900'
    : 'bg-[#0f1d2a] border border-slate-700/70 text-white';

  const cardHeading = isDark ? 'text-slate-900' : 'text-white';
  const cardDesc = isDark ? 'text-slate-600' : 'text-slate-300';
  const statLabel = isDark ? 'text-slate-600 font-semibold' : 'text-slate-300 font-semibold';
  const statVal = isDark ? 'text-slate-900 font-black' : 'text-white font-black';

  const modalBg = isDark
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-[#13222e] border-slate-700 text-white shadow-2xl';

  const inputBg = isDark
    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#ea580c]'
    : 'bg-[#0f1d2a] border-slate-700 text-white focus:border-[#ea580c]';

  // Citizen Profile State (persisted in localStorage)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('roadeye_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return {
      name: 'Om Soni',
      email: 'om.soni@roadeye.org',
      region: 'Municipal Road Safety Division',
      role: 'Civic Road Reporter'
    };
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(profile);

  // Live Stats State
  const [stats, setStats] = useState({
    totalDetections: 0,
    potholesFound: 0,
    highSeverity: 0,
    reportsGenerated: 0,
  });

  useEffect(() => {
    // Load live stats from Flask backend
    api.getDashboardStats().then((res) => {
      if (res && res.success) {
        setStats({
          totalDetections: res.totalDetections || 0,
          potholesFound: res.potholesFound || 0,
          highSeverity: res.highSeverity || 0,
          reportsGenerated: res.reportsGenerated || 0,
        });
      }
    });
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(formData);
    try {
      localStorage.setItem('roadeye_profile', JSON.stringify(formData));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    setEditModalOpen(false);
  };

  return (
    <Stagger3D delay={0.07} className="max-w-4xl mx-auto space-y-7 pb-10">
      {/* 1. Header (On Canvas) with 3D Holographic Core */}
      <Item3D tiltOnHover={false}>
        <div className={`pb-4 border-b ${pageDivider} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${pageHeading}`}>
              Profile & Activity
            </h1>
            <p className={`text-xs sm:text-sm ${pageSubtitle} mt-1 font-medium`}>
              Manage your citizen reporter details and monitor community pavement inspection metrics.
            </p>
          </div>
        </div>
      </Item3D>

      {/* 2. Citizen Profile Card with 3D Tilt */}
      <TiltCard3D maxTilt={6}>
        <div className={`rounded-2xl p-6 sm:p-8 border transition-colors ${cardBg} flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar Circle with initial 'O' matching navbar */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-amber-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-orange-400/40 shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'O'}
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${cardHeading}`}>
                  {profile.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#ea580c] mx-auto sm:mx-0 w-fit">
                  <CheckCircle2 size={12} />
                  <span>Verified Contributor</span>
                </span>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs ${cardDesc} pt-1`}>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={13} className="text-[#ea580c] shrink-0" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin size={13} className="text-emerald-500 shrink-0" />
                  <span>{profile.region}</span>
                </div>
              </div>

              <p className={`text-xs ${cardDesc} pt-1`}>
                Role: <strong className={cardHeading}>{profile.role}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Profile Button with 3D click */}
            <Click3D scaleDown={0.92} depth={-8}>
              <button
                onClick={() => {
                  setFormData(profile);
                  setEditModalOpen(true);
                }}
                className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
                  isDark
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-[#0f1d2a] hover:bg-slate-800 border-slate-700/70 text-slate-200'
                }`}
                title="Edit Profile Information"
              >
                <Edit3 size={14} className="text-[#ea580c]" />
                <span>Edit Profile</span>
              </button>
            </Click3D>

            {/* Sign Out Button with 3D click */}
            <Click3D scaleDown={0.92} depth={-8}>
              <button
                onClick={logout}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
                  isDark
                    ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
                title="Sign out of RoadEye"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </Click3D>
          </div>
        </div>
      </TiltCard3D>

      {/* 3. Community Inspection Metrics (4 High-Contrast Stat Cards) */}
      <div className={`rounded-2xl p-6 sm:p-8 space-y-5 border transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#ea580c]" />
            <h3 className={`text-base font-bold tracking-tight ${cardHeading}`}>
              Civic Inspection Impact
            </h3>
          </div>
          <span className={`text-xs font-medium ${cardDesc}`}>
            Real-time model inference telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Stat 1: Total Scans */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1`}>
            <span className={`text-xs uppercase tracking-wider block ${statLabel}`}>
              Total Scans
            </span>
            <span className={`text-2xl font-black block ${statVal}`}>
              {stats.totalDetections}
            </span>
            <span className={`text-[11px] block ${cardDesc}`}>
              Inspection passes
            </span>
          </div>

          {/* Stat 2: Potholes Logged */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1`}>
            <span className={`text-xs uppercase tracking-wider block ${statLabel}`}>
              Potholes Logged
            </span>
            <span className="text-2xl font-black text-[#ea580c] block">
              {stats.potholesFound}
            </span>
            <span className={`text-[11px] block ${cardDesc}`}>
              Surface defects found
            </span>
          </div>

          {/* Stat 3: High Hazard */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1`}>
            <span className={`text-xs uppercase tracking-wider block ${statLabel}`}>
              High Hazard
            </span>
            <span className="text-2xl font-black text-red-500 block">
              {stats.highSeverity}
            </span>
            <span className={`text-[11px] block ${cardDesc}`}>
              Urgent repair spots
            </span>
          </div>

          {/* Stat 4: Reports Filed */}
          <div className={`p-4 rounded-xl border transition-colors ${innerCard} space-y-1`}>
            <span className={`text-xs uppercase tracking-wider block ${statLabel}`}>
              Reports Filed
            </span>
            <span className="text-2xl font-black text-emerald-500 block">
              {stats.reportsGenerated}
            </span>
            <span className={`text-[11px] block ${cardDesc}`}>
              Certified audit logs
            </span>
          </div>
        </div>
      </div>

      {/* 4. Citizen Quick Actions with 3D Click */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Click3D fullWidth scaleDown={0.96} depth={-12} tiltX={-3}>
          <Link
            to="/detection"
            className={`block p-5 rounded-2xl border transition-all ${cardBg} space-y-2 group`}
          >
            <div className="h-9 w-9 rounded-xl bg-orange-500/15 text-[#ea580c] border border-orange-500/30 flex items-center justify-center font-bold">
              <Scan size={18} />
            </div>
            <h4 className={`text-sm font-bold ${cardHeading} group-hover:text-[#ea580c] transition-colors`}>
              Inspect New Road
            </h4>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Upload photos, dashcam videos, or stream live camera feeds.
            </p>
          </Link>
        </Click3D>

        <Click3D fullWidth scaleDown={0.96} depth={-12} tiltX={-3}>
          <Link
            to="/reports"
            className={`block p-5 rounded-2xl border transition-all ${cardBg} space-y-2 group`}
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <h4 className={`text-sm font-bold ${cardHeading} group-hover:text-emerald-500 transition-colors`}>
              Audit Reports
            </h4>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              View inspection history and download official PDF audit reports.
            </p>
          </Link>
        </Click3D>

        <Click3D fullWidth scaleDown={0.96} depth={-12} tiltX={-3}>
          <Link
            to="/about"
            className={`block p-5 rounded-2xl border transition-all ${cardBg} space-y-2 group`}
          >
            <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <h4 className={`text-sm font-bold ${cardHeading} group-hover:text-blue-500 transition-colors`}>
              Safety Guidelines
            </h4>
            <p className={`text-xs leading-relaxed ${cardDesc}`}>
              Review hazard severity ratings and citizen reporting best practices.
            </p>
          </Link>
        </Click3D>
      </div>

      {/* 6. EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl ${modalBg}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#ea580c]" />
                <h3 className={`text-base font-bold ${cardHeading}`}>Edit Citizen Profile</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${statLabel}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border outline-none transition-colors ${inputBg}`}
                  placeholder="e.g. Om Soni"
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${statLabel}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border outline-none transition-colors ${inputBg}`}
                  placeholder="e.g. om.soni@roadeye.org"
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${statLabel}`}>
                  Locality / Municipal Division
                </label>
                <input
                  type="text"
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border outline-none transition-colors ${inputBg}`}
                  placeholder="e.g. Municipal Road Safety Division"
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${statLabel}`}>
                  Citizen Role
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border outline-none transition-colors ${inputBg}`}
                  placeholder="e.g. Civic Road Reporter"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/60">
                <Click3D scaleDown={0.92} depth={-6}>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${isDark
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    Cancel
                  </button>
                </Click3D>
                <Click3D scaleDown={0.92} depth={-10}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#ea580c] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </Click3D>
              </div>
            </form>
          </div>
        </div>
      )}
    </Stagger3D>
  );
}
