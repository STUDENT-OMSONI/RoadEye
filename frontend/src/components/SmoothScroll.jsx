import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * 1. SCROLL PROGRESS BAR
 * A glowing, ultra-sleek progress beam along the top viewport edge that fills smoothly as you scroll.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ea580c] via-amber-500 to-sky-400 z-50 pointer-events-none shadow-[0_0_8px_rgba(234,88,12,0.6)]"
    />
  );
}

/**
 * 2. NATIVE HARDWARE-ACCELERATED SMOOTH SCROLL PROVIDER
 * Enables 60FPS/120FPS native GPU-accelerated scrolling on desktop & laptop.
 * Eliminates synthetic event hijacking to guarantee silky-smooth trackpad & mouse glide.
 */
export function SmoothKineticScroll() {
  useEffect(() => {
    // Expose global smooth scroll function for buttons/links using native compositor thread
    window.smoothScrollTo = (toY) => {
      window.scrollTo({
        top: toY,
        behavior: 'smooth',
      });
    };

    return () => {
      delete window.smoothScrollTo;
    };
  }, []);

  return null;
}

/**
 * 3. BUTTERY SCROLL REVEAL WRAPPER
 * Smoothly floats sections and cards into view using Apple/Stripe ease-out cubic-bezier curves.
 * Eliminates spring jitter and oscillations for silky, premium transitions.
 */
export function ScrollReveal({
  children,
  delay = 0,
  yOffset = 24,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo: decelerates smoothly with zero vibration
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
