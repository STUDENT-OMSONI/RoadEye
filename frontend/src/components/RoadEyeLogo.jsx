import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function RoadEyeLogo({
  size = 32,
  showText = true,
  textClass = 'text-xl font-black tracking-tight',
  forceDark = false,
  darkBackground = undefined,
  accentColor = '#ea580c',
}) {
  const { isDark } = useTheme();

  // If darkBackground is explicitly provided, respect it; otherwise default to isDark
  const isDarkBg = darkBackground !== undefined ? darkBackground : isDark;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none group">
      {/* BrevetUp-style Road & Wheel Geometric Emblem */}
      <svg
        width={size}
        height={Math.round(size * 1.08)}
        viewBox="0 0 116 125"
        fill="currentColor"
        fillRule="evenodd"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-colors duration-200 ${isDarkBg ? 'text-white' : 'text-slate-900'}`}
        aria-hidden="true"
      >
        <path d="M 97,80 L 99,83 L 94,92 L 84,102 L 76,107 L 71,108 L 69,109 L 67,112 L 67,114 L 66,116 L 62,117 L 62,94 L 63,92 L 68,89 L 74,82 L 77,80 Z M 18,80 L 38,80 L 40,81 L 49,91 L 48,118 L 45,117 L 45,115 L 42,108 L 37,106 L 31,102 L 21,92 L 19,89 L 16,82 Z M 63,61 L 65,63 L 63,65 L 57,65 L 52,68 L 49,73 L 49,79 L 47,81 L 44,78 L 44,69 L 45,67 L 50,62 L 54,60 L 61,60 Z M 0,67 L 1,80 L 4,89 L 11,101 L 22,112 L 28,116 L 42,122 L 55,124 L 73,122 L 93,112 L 104,101 L 112,87 L 115,76 L 115,67 L 79,67 L 69,58 L 63,55 L 52,55 L 46,58 L 36,67 Z M 58,17 L 57,26 L 56,27 L 55,41 L 55,48 L 60,48 L 60,39 L 59,27 L 58,26 Z M 3,54 L 3,56 L 34,55 L 54,12 L 56,10 L 59,10 L 68,26 L 81,55 L 112,56 L 112,54 L 60,0 L 55,0 L 52,2 Z" />
      </svg>

      {showText && (
        <span className={`font-black tracking-tight font-sans ${textClass}`}>
          <span className={isDarkBg ? 'text-white' : 'text-slate-900'}>Road</span>
          <span style={{ color: accentColor }}>Eye</span>
        </span>
      )}
    </div>
  );
}
