import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SeverityBadge({ severity = 'Low', size = 'md', showIcon = true, pulse = false }) {
  const { isDark } = useTheme();
  const norm = String(severity).toLowerCase();

  let colors = {
    bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
    border: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
    text: isDark ? 'text-emerald-400' : 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Low Severity',
    Icon: CheckCircle2
  };

  if (norm.includes('high') || norm === 'critical') {
    colors = {
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      border: isDark ? 'border-red-500/30' : 'border-red-200',
      text: isDark ? 'text-red-400' : 'text-red-700',
      dot: 'bg-red-500',
      label: 'High Severity',
      Icon: AlertCircle
    };
  } else if (norm.includes('med')) {
    colors = {
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDark ? 'border-amber-500/30' : 'border-amber-200',
      text: isDark ? 'text-amber-400' : 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Medium Severity',
      Icon: AlertTriangle
    };
  }

  const { Icon } = colors;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }[size] || 14;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colors.bg} ${colors.border} ${colors.text} ${sizeClasses} tracking-wide transition-colors`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`}></span>
        </span>
      )}
      <span>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
    </span>
  );
}

