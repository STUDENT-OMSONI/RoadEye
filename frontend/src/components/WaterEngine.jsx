import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * WATER CANVAS ENGINE
 * High-performance 60FPS fluid water ripple & ambient caustic wave system.
 * 
 * Features:
 * 1. Interactive water droplet ripples whenever the user clicks/taps anywhere on the site.
 * 2. Natural ambient rain/water droplet ripples periodically falling into the calm surface.
 * 3. Fluid undulating caustic water currents running softly in the background.
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

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Active ripples pool
    const ripples = [];

    // Ambient floating caustic currents
    let phase = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create a new water ripple at (x, y)
    const addRipple = (x, y, power = 1) => {
      if (ripples.length > 25) {
        ripples.shift(); // keep pool lightweight
      }
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: Math.min(width, height) * 0.35 * power,
        speed: 2.2 * power,
        alpha: 0.65 * power,
        decay: 0.009,
        rings: 3,
        distortion: 1.5,
      });
    };

    // Global click listener to emit water ripples on user interaction
    const handleClick = (e) => {
      addRipple(e.clientX, e.clientY, 1.1);
    };

    // Periodic ambient natural water droplets falling
    const ambientInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const randomX = Math.random() * width;
        const randomY = Math.random() * height;
        addRipple(randomX, randomY, 0.6 + Math.random() * 0.4);
      }
    }, 2800);

    window.addEventListener('pointerdown', handleClick, { passive: true });

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render expanding concentric water droplet ripples (Clean liquid ripples only, no horizontal wave bands)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= r.decay;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw multiple concentric water wave rings for realistic liquid refraction
        for (let ring = 0; ring < r.rings; ring++) {
          const currentRadius = r.radius - ring * 18;
          if (currentRadius <= 0) continue;

          const ringAlpha = Math.max(0, r.alpha * (1 - ring * 0.28));

          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);

          // Water crest highlight
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${ringAlpha * 0.6})`
            : `rgba(2, 132, 199, ${ringAlpha * 0.5})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Subtle secondary caustic refraction ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${ringAlpha * 0.3})`
            : `rgba(186, 230, 253, ${ringAlpha * 0.4})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      clearInterval(ambientInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-[30] opacity-80"
      style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
    />
  );
}

