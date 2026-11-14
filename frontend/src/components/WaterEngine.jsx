import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * WATER CANVAS ENGINE
 * High-performance fluid water ripple & ambient caustic wave system.
 * 
 * Features:
 * 1. Interactive water droplet ripples whenever the user clicks/taps anywhere on the site.
 * 2. Natural ambient rain/water droplet ripples periodically falling into the calm surface.
 * 3. Smart Idle Suspension: Completely pauses RAF rendering when ripples settle, freeing 100% GPU for silky 60/120FPS scrolling.
 * 4. 100% non-intrusive (pointer-events-none), zero performance drag on UI interactions.
 */
export function WaterRippleCanvas() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let isRunning = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Active ripples pool
    const ripples = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (ripples.length === 0) {
        ctx.clearRect(0, 0, width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Smart Idle Suspension
    const render = () => {
      if (ripples.length === 0) {
        ctx.clearRect(0, 0, width, height);
        isRunning = false;
        return; // Suspend loop when resting
      }

      ctx.clearRect(0, 0, width, height);

      // Render expanding concentric water droplet ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= r.decay;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw concentric water wave rings for realistic liquid refraction
        for (let ring = 0; ring < r.rings; ring++) {
          const currentRadius = r.radius - ring * 16;
          if (currentRadius <= 0) continue;

          const ringAlpha = Math.max(0, r.alpha * (1 - ring * 0.28));

          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);

          // Water crest highlight
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${ringAlpha * 0.55})`
            : `rgba(2, 132, 199, ${ringAlpha * 0.45})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Subtle secondary caustic refraction ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${ringAlpha * 0.25})`
            : `rgba(186, 230, 253, ${ringAlpha * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Create a new water ripple at (x, y)
    const addRipple = (x, y, power = 1) => {
      if (ripples.length > 20) {
        ripples.shift();
      }
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: Math.min(width, height) * 0.32 * power,
        speed: 2.0 * power,
        alpha: 0.6 * power,
        decay: 0.011,
        rings: 3,
      });
      startLoop();
    };

    // Global click listener to emit water ripples on user interaction
    const handleClick = (e) => {
      addRipple(e.clientX, e.clientY, 1.0);
    };

    // Periodic ambient natural water droplets falling
    const ambientInterval = setInterval(() => {
      if (Math.random() > 0.35) {
        const randomX = Math.random() * width;
        const randomY = Math.random() * height;
        addRipple(randomX, randomY, 0.5 + Math.random() * 0.35);
      }
    }, 3500);

    window.addEventListener('pointerdown', handleClick, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      clearInterval(ambientInterval);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-[30] opacity-75"
      style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
    />
  );
}
