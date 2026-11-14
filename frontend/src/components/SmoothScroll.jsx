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
 * 2. LENIS-GRADE ULTRA-SMOOTH KINETIC SCROLL ENGINE
 * Transforms stepped mouse wheel clicks into silky-smooth 60/120FPS momentum gliding.
 * Features:
 * - Delta normalization across all browsers (Chrome, Firefox, Safari) and deltaModes (pixels, lines, pages).
 * - Automatic precision trackpad detection to preserve native hardware inertia without fighting the OS.
 * - Exponential deceleration (lerp = 0.08) for luxurious, frictionless motion.
 * - Zero CPU/GPU drain when idle (cancels RAF loop as soon as resting position is reached).
 * - Global window.smoothScrollTo API for programmatic smooth section navigation.
 */
export function SmoothKineticScroll() {
  useEffect(() => {
    // Only apply on desktop non-touch devices with fine pointers
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;
    let rafId = null;

    // Silkiness factor: 0.085 provides luxurious, Apple-grade momentum damping
    const lerp = 0.085;

    const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const update = () => {
      const diff = targetY - currentY;

      if (Math.abs(diff) > 0.4) {
        currentY += diff * lerp;
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(update);
      } else {
        // Settled into rest
        currentY = targetY;
        window.scrollTo(0, targetY);
        isRunning = false;
      }
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY;
        rafId = requestAnimationFrame(update);
      }
    };

    const handleWheel = (e) => {
      // Don't intercept if scrolling inside scrollable containers (e.g. modals, code boxes, textareas)
      const path = e.composedPath ? e.composedPath() : [];
      for (const el of path) {
        if (el instanceof HTMLElement && el !== document.body && el !== document.documentElement) {
          const style = window.getComputedStyle(el);
          const canScrollY = el.scrollHeight > el.clientHeight;
          if (canScrollY && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
            return; // Allow native inner container scrolling
          }
        }
      }

      // Normalize delta based on deltaMode (0 = pixels, 1 = lines, 2 = pages)
      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 38; // Normal line height
      } else if (e.deltaMode === 2) {
        delta *= window.innerHeight; // Full page
      }

      // Precision trackpads emit continuous small deltas with fractional values.
      // Allow precision trackpads to use native OS fluid physics.
      const isPrecisionTrackpad = Math.abs(delta) < 14 || Math.abs(delta) % 1 !== 0;
      if (isPrecisionTrackpad) {
        // Update targets so subsequent wheel turns stay synchronized
        targetY = window.scrollY;
        currentY = window.scrollY;
        return;
      }

      e.preventDefault();

      // Mouse wheel stepped notch: Apply momentum impulse with friction
      targetY = clamp(targetY + delta * 1.05, 0, getMaxScroll());
      startLoop();
    };

    const handleScroll = () => {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    // Expose global smooth scroll function for buttons/links
    window.smoothScrollTo = (toY, duration = 650) => {
      targetY = clamp(toY, 0, getMaxScroll());
      startLoop();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
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
