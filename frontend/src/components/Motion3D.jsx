import React from 'react';
import { motion } from 'framer-motion';

/**
 * Click3D: Wraps buttons, icons, or links with realistic 3D depth press,
 * spring recoil, and subtle 3D perspective rotation on click.
 */
export function Click3D({
  children,
  className = '',
  scaleDown = 0.93,
  depth = -18,
  tiltX = -6,
  fullWidth = false,
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
        y: -3,
        z: 14,
        transition: { type: 'spring', stiffness: 450, damping: 20 },
      }}
      whileTap={{
        scale: scaleDown,
        y: 2,
        z: depth,
        rotateX: tiltX,
        transition: { type: 'spring', stiffness: 600, damping: 15 },
      }}
      onClick={onClick}
      className={`cursor-pointer select-none ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(12px)', width: fullWidth ? '100%' : 'auto' }}>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Stagger3D: Container that cascades its children into 3D view with staggered delays
 */
export function Stagger3D({
  children,
  className = '',
  delay = 0.07,
  initialDelay = 0.05,
  ...props
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Item3D: Individual element in a staggered container that sweeps into 3D perspective
 */
export function Item3D({
  children,
  className = '',
  tiltOnHover = false,
  hoverLift = true,
  ...props
}) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 28,
      scale: 0.95,
      rotateX: 10,
      z: -50,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      z: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={
        tiltOnHover
          ? {
              y: -5,
              scale: 1.02,
              z: 18,
              rotateX: 3,
              transition: { type: 'spring', stiffness: 350, damping: 20 },
            }
          : hoverLift
          ? {
              y: -2,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }
          : {}
      }
      className={className}
      {...props}
    >
      <div style={{ transform: 'translateZ(8px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Card3DClick: Interactive 3D card with click depression and hover elevation
 */
export function Card3DClick({
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
        z: 16,
        rotateX: 2,
        transition: { type: 'spring', stiffness: 350, damping: 20 },
      }}
      whileTap={{
        scale: 0.96,
        z: -14,
        rotateX: -4,
        y: 2,
        transition: { type: 'spring', stiffness: 500, damping: 15 },
      }}
      onClick={onClick}
      className={`cursor-pointer transition-shadow duration-300 ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(12px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
