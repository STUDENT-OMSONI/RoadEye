import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
} from 'lucide-react';
import RoadEyeLogo from '../components/RoadEyeLogo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Click3D } from '../components/Motion3D';
import {
  NebulaFrame,
  LuminaMotion,
  AetherLoop,
  PixelDrift,
} from '../components/MotionPlusEngine';

export default function Login() {
  const { isDark } = useTheme();
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    email: 'om.soni@roadeye.org',
    password: '••••••••••••',
  });

  // Card theme tokens:
  // In Dark Mode: Sleek dark glass card (#0e1a26) with white text
  // In Light Mode: Crisp white glass card with dark text
  const cardBg = isDark
    ? 'bg-[#0e1a26]/95 border border-slate-700/60 text-white shadow-2xl shadow-black/50 backdrop-blur-xl'
    : 'bg-white/95 border border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-950/20 backdrop-blur-xl';

  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const descColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const labelColor = isDark ? 'text-slate-200' : 'text-slate-700';
  const dividerColor = isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400';

  const inputStyle = isDark
    ? 'bg-[#09121a] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/25'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20';

  const socialBtn = isDark
    ? 'bg-[#09121a] hover:bg-slate-800 border-slate-700 text-slate-200 hover:shadow-md'
    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:shadow-md';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const userProfile = {
        name: isSignUp && formData.name ? formData.name : 'Om Soni',
        email: formData.email || 'om.soni@roadeye.org',
        region: 'Municipal Road Safety Division',
        role: 'Civic Road Reporter'
      };

      login(userProfile);
      setLoading(false);
      navigate('/');
    }, 400);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const userProfile = {
        name: 'Om Soni (Google)',
        email: 'om.soni@gmail.com',
        region: 'Municipal Road Safety Division',
        role: 'Verified Civic Reporter'
      };
      login(userProfile);
      setLoading(false);
      navigate('/');
    }, 400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      {/* NebulaFrame Breathing Ambient Contour Rim */}
      <NebulaFrame rounded="rounded-[32px]" className="shadow-2xl">
        {/* 2-Column Split Card matching Havenix-style modern layout */}
        <div className={`relative rounded-[32px] border overflow-hidden transition-all duration-300 ${cardBg} grid grid-cols-1 lg:grid-cols-12`}>
          
          {/* Subtle decorative glowing corner accent */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#ea580c]/15 via-transparent to-transparent pointer-events-none rounded-br-full blur-2xl" />

          {/* ========================================================================= */}
          {/* LEFT COLUMN: Clean, Attractive Auth Form with 3D Clicks */}
          {/* ========================================================================= */}
          <div className="relative z-10 lg:col-span-6 xl:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Top Brand Logo with AetherLoop zero-gravity float */}
              <div>
                <AetherLoop amplitude={2} duration={5}>
                  <Link to="/" className="inline-block group">
                    <RoadEyeLogo
                      size={36}
                      textClass="text-2xl font-black tracking-tight"
                      darkBackground={isDark}
                    />
                  </Link>
                </AetherLoop>
              </div>

              {/* Header Titles */}
              <div className="space-y-1.5 pt-1">
                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${headingColor}`}>
                  {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${descColor}`}>
                  {isSignUp
                    ? 'Join our civic road safety network and start logging hazard audits'
                    : 'Log in to enter the autonomous pavement inspection platform'}
                </p>
              </div>

            {/* Authenticated user banner if visited while logged in */}
            {isAuthenticated && (
              <div className="p-3.5 rounded-2xl bg-[#ea580c]/15 border border-[#ea580c]/30 flex items-center justify-between text-xs backdrop-blur-sm">
                <div>
                  <span className="text-[#ea580c] font-black">Logged In:</span>{' '}
                  <span className={`font-bold ${headingColor}`}>{user?.name || 'Om Soni'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Click3D scaleDown={0.92} depth={-8}>
                    <Link
                      to="/"
                      className="px-3 py-1 rounded-xl bg-[#ea580c] text-white font-extrabold text-[11px] hover:bg-orange-600 transition-all shadow-sm"
                    >
                      Enter App
                    </Link>
                  </Click3D>
                  <Click3D scaleDown={0.92} depth={-8}>
                    <button
                      type="button"
                      onClick={logout}
                      className={`px-3 py-1 rounded-xl border font-extrabold text-[11px] transition-colors ${
                        isDark
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Sign Out
                    </button>
                  </Click3D>
                </div>
              </div>
            )}

            {/* Google One-Click Login with 3D Press */}
            <div>
              <Click3D fullWidth scaleDown={0.96} depth={-14} tiltX={-4}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-sm ${socialBtn}`}
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </Click3D>
            </div>

            {/* Sleek Divider */}
            <div className={`relative flex items-center justify-center my-3 border-t ${dividerColor}`}>
              <span className={`absolute px-3 text-[11px] font-bold uppercase tracking-widest ${isDark ? 'bg-[#0e1a26] text-slate-400' : 'bg-white text-slate-400'}`}>
                Or continue with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {isSignUp && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${labelColor}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Om Soni"
                      className={`w-full rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm border outline-none transition-all ${inputStyle}`}
                    />
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${labelColor}`}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className={`w-full rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm border outline-none transition-all ${inputStyle}`}
                  />
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${labelColor}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className={`w-full rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm border outline-none transition-all ${inputStyle}`}
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-orange-500 transition-colors p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-[#ea580c] focus:ring-[#ea580c] accent-[#ea580c]"
                  />
                  <span className={`${descColor} font-medium`}>Remember me</span>
                </label>

                <Click3D scaleDown={0.92} depth={-6}>
                  <button
                    type="button"
                    onClick={() => alert('Password reset verification link sent to your registered email.')}
                    className="font-bold text-[#ea580c] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </Click3D>
              </div>

              {/* Enter RoadEye CTA Button with LuminaMotion Traveling Edge Shimmer */}
              <LuminaMotion fullWidth>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#ea580c] via-orange-600 to-amber-600 hover:from-orange-600 hover:to-orange-500 text-white font-black text-sm py-3.5 transition-all shadow-md shadow-black/20 disabled:opacity-70 group"
                >
                  <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account & Enter' : 'Enter RoadEye Platform'}</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </LuminaMotion>
            </form>
          </div>

          {/* Bottom Switcher */}
          <div className="pt-6 text-center text-xs">
            <span className={`${descColor} font-medium`}>
              {isSignUp ? 'Already registered with RoadEye? ' : "Don't have an account? "}
            </span>
            <Click3D scaleDown={0.92} depth={-6}>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-black text-[#ea580c] hover:underline cursor-pointer ml-1"
              >
                {isSignUp ? 'Sign In' : 'Create Free Account'}
              </button>
            </Click3D>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Clean, Gorgeous Moving Traffic Video (100% clean, no text) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 p-3 sm:p-5 pl-0">
          <div className="relative h-full min-h-[580px] w-full rounded-[28px] overflow-hidden shadow-2xl border border-white/10 group bg-slate-950">
            {/* Moving Video Background - completely clean screen */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/login-road.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/videos/traffic-cars.mp4"
            />
          </div>
        </div>

        </div>
      </NebulaFrame>
    </div>
  );
}
