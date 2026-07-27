import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

/**
 * AnimatedGradientBackground
 *
 * Renders a customizable animated radial gradient background with a subtle
 * breathing effect. Uses framer-motion for the entrance animation and raw
 * CSS gradients (via rAF) for the ongoing breathing animation.
 *
 * Props:
 * - startingGap: initial radial gradient size (default 125)
 * - Breathing: enable/disable the breathing effect (default false)
 * - gradientColors: array of colors used in the radial gradient
 * - gradientStops: array of percentage stops matching gradientColors
 * - animationSpeed: speed of the breathing animation (default 0.02)
 * - breathingRange: how far the gradient expands/contracts (default 5)
 * - containerStyle / containerClassName: extra styling for the container
 * - topOffset: additional top offset for the gradient
 */
const AnimatedGradientBackground = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    '#020617',
    '#1d4ed8',
    '#4f46e5',
    '#0ea5e9',
    '#22c55e',
    '#0f172a',
  ],
  gradientStops = [35, 50, 60, 70, 80, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = '',
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
       Received gradientColors length: ${gradientColors.length},
       gradientStops length: ${gradientStops.length}`
    );
  }

  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrame;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;

      if (!Breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(', ');

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] },
      }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform"
      />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
