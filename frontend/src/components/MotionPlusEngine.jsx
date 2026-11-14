import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * 1. MOTION PULSE 3D
 * Provides rhythmic breathing 3D depth, micro-tactile spring click depression,
 * and elevation recoil for cards, badges, and action elements.
 */
export function MotionPulse3D({
  children,
  className = '',
  pulseScale = 1.018,
  depth = -14,
  pulseSpeed = 4,
  onClick,
  ...props
}) {
  return (
    <motion.div
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.96,
        y: 1,
        transition: { duration: 0.1, ease: 'easeOut' },
      }}
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(10px)' }}>{children}</div>
    </motion.div>
  );
}

/**
 * 2. AETHER LOOP
 * Seamless zero-gravity ambient floating loop. Gently translates and micro-tilts
 * elements so focal cards, badges, and headers feel weightless, alive, and modern.
 */
export function AetherLoop({
  children,
  className = '',
  amplitude = 5,
  tilt = 0.8,
  duration = 5.5,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotateX: [-tilt, tilt, -tilt],
        rotateY: [tilt * 0.5, -tilt * 0.5, tilt * 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3. PIXEL DRIFT STUDIO
 * Atmospheric ambient floating micro-particles and stardust that drift smoothly
 * in the background space behind sections without blocking imagery or text.
 */
export function PixelDrift({
  className = '',
  count = 20,
  color = '#ea580c',
  accentColor = '#38bdf8',
}) {
  // Generate stable particle points
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 19) % 96 + 2}%`,
    top: `${(i * 29) % 90 + 5}%`,
    size: (i % 3) + 1.8,
    duration: 8 + (i % 6) * 2,
    delay: (i % 5) * 1.2,
    isAccent: i % 4 === 0,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.isAccent ? accentColor : color,
            boxShadow: `0 0 ${p.size * 2}px ${p.isAccent ? accentColor : color}`,
          }}
          animate={{
            y: [-12, -45, -12],
            x: [-6, 8, -6],
            opacity: [0.15, 0.65, 0.15],
            scale: [0.8, 1.25, 0.8],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * 4. NEBULA FRAME
 * Atmospheric ambient border illumination. An elegant, subtle breathing gradient
 * contour framing interactive cards, giving them architectural high-tech presence.
 */
export function NebulaFrame({
  children,
  className = '',
  glowColor = 'rgba(234, 88, 12, 0.18)',
  accentGlow = 'rgba(56, 189, 248, 0.14)',
  rounded = 'rounded-2xl',
  ...props
}) {
  return (
    <div className={`relative p-[1px] group ${rounded} ${className}`} {...props}>
      {/* Ambient Gradient Rim with GPU-accelerated Hover Glow */}
      <div
        style={{
          background: `linear-gradient(135deg, ${glowColor} 0%, transparent 50%, ${accentGlow} 100%)`,
        }}
        className={`absolute inset-0 ${rounded} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Card Content Surface */}
      <div className={`relative h-full ${rounded} overflow-hidden z-10`}>
        {children}
      </div>
    </div>
  );
}

/**
 * 5. PRISM FORGE
 * Dynamic prismatic light sheen across cards. An iridescent light refraction
 * that smoothly sweeps across when hovered, giving an Apple/Stripe specular sheen.
 */
export function PrismForge({
  children,
  className = '',
  onClick,
  ...props
}) {
  return (
    <motion.div
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={{
        y: -4,
        scale: 1.015,
        z: 14,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
      whileTap={{
        scale: 0.965,
        z: -12,
        y: 2,
        transition: { type: 'spring', stiffness: 500, damping: 15 },
      }}
      onClick={onClick}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      {...props}
    >
      {/* Underlying Content */}
      <div style={{ transform: 'translateZ(10px)' }} className="w-full h-full">
        {children}
      </div>

      {/* Prismatic Specular Sheen Glaze */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden"
      >
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 3.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            background:
              'linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.16) 45%, rgba(234, 88, 12, 0.14) 52%, rgba(56, 189, 248, 0.14) 58%, transparent 80%)',
          }}
          className="w-full h-full transform skew-x-12"
        />
      </div>
    </motion.div>
  );
}

/**
 * 6. VOXEL WAVE
 * Rhythmic undulating equalizer / telemetry wave bars. Animates real-time
 * model inference and civic sensor activity with rhythmic life.
 */
export function VoxelWave({
  bars = 5,
  color = '#ea580c',
  accentColor = '#38bdf8',
  className = '',
}) {
  return (
    <div className={`inline-flex items-end gap-[3px] h-3.5 select-none ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          style={{
            width: 2.5,
            borderRadius: 1.5,
            backgroundColor: i % 2 === 0 ? color : accentColor,
          }}
          animate={{
            height: [
              `${30 + ((i * 15) % 60)}%`,
              `${80 - ((i * 12) % 45)}%`,
              `${40 + ((i * 20) % 55)}%`,
              `${30 + ((i * 15) % 60)}%`,
            ],
          }}
          transition={{
            duration: 1.2 + (i % 3) * 0.25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

/**
 * 7. LUMINA MOTION
 * Luminous button / interactive trigger wrapper with traveling light edge
 * shimmer, glowing focus depth, and crisp 3D tactile press response.
 */
export function LuminaMotion({
  children,
  className = '',
  fullWidth = false,
  glow = true,
  onClick,
  ...props
}) {
  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        perspective: 800,
        display: fullWidth ? 'block' : 'inline-block',
        width: fullWidth ? '100%' : 'auto',
      }}
      whileHover={{
        scale: 1.025,
        y: -2.5,
        z: 12,
        transition: { type: 'spring', stiffness: 450, damping: 20 },
      }}
      whileTap={{
        scale: 0.94,
        y: 2,
        z: -14,
        rotateX: -4,
        transition: { type: 'spring', stiffness: 600, damping: 15 },
      }}
      onClick={onClick}
      className={`relative cursor-pointer select-none group ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(8px)', width: fullWidth ? '100%' : 'auto' }}>
        {children}
      </div>

      {/* Lumina Edge Glow Sweeper */}
      {glow && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            animate={{
              x: ['-120%', '160%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>
      )}
    </motion.div>
  );
}

