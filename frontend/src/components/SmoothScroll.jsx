import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * 1. SCROLL PROGRESS BAR
 * A glowing, ultra-sleek progress beam along the top viewport edge that fills smoothly as you scroll.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ea580c] via-amber-500 to-sky-400 z-50 pointer-events-none shadow-[0_0_10px_rgba(234,88,12,0.7)]"
    />
  );
}

/**
 * 2. SMOOTH KINETIC SCROLL ENGINE
 * Provides butter-smooth, silky momentum damping for mouse wheel navigation on desktop.
 * Transforms choppy 100px clicks into luxurious 60FPS fluid motion.
 */
export function SmoothKineticScroll() {
  useEffect(() => {
    // Only apply on desktop non-touch devices with fine pointers
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isTicking = false;
    let rafId = null;

    const ease = 0.09; // Silky smooth damping factor

    const updateScroll = () => {
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        currentY += diff * ease;
        window.scrollTo(0, Math.round(currentY));
        rafId = requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetY);
        currentY = targetY;
        isTicking = false;
      }
    };

    const handleWheel = (e) => {
      // Don't intercept if scrolling inside scrollable containers like textareas or code blocks
      const path = e.composedPath ? e.composedPath() : [];
      for (const el of path) {
        if (el instanceof HTMLElement && el !== document.body && el !== document.documentElement) {
          const hasScroll = el.scrollHeight > el.clientHeight;
          const overflowY = window.getComputedStyle(el).overflowY;
          if (hasScroll && (overflowY === 'auto' || overflowY === 'scroll')) {
            return; // let native inner scroll work
          }
        }
      }

      e.preventDefault();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(targetY + e.deltaY * 0.9, maxScroll));

      if (!isTicking) {
        isTicking = true;
        currentY = window.scrollY;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    // Update target on direct programmatic or bar scroll
    const handleScroll = () => {
      if (!isTicking) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

/**
 * 3. SCROLL REVEAL WRAPPER
 * Smoothly floats sections and cards into view with 3D perspective and spring physics.
 */
export function ScrollReveal({
  children,
  delay = 0,
  yOffset = 32,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 24,
        mass: 0.8,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

