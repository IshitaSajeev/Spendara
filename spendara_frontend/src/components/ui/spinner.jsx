import React from 'react';
import { motion } from 'framer-motion';

const DOT_COUNT = 12;

// Matches the app's palette: blue -> indigo -> emerald, fading toward slate
const DOT_COLORS = [
  '#3b82f6', '#3b82f6', '#4f46e5', '#4f46e5',
  '#6366f1', '#6366f1', '#0ea5e9', '#0ea5e9',
  '#22c55e', '#22c55e', '#1e293b', '#1e293b',
];

/**
 * Spinner - a themed circular fading-dot loader (Spendara brand spinner).
 * Reuse this anywhere a loading state is needed for visual consistency.
 *
 * Props:
 * - size: overall diameter in px (default 64)
 * - label: optional text shown below the spinner
 */
const Spinner = ({ size = 64, label }) => {
  const radius = size / 2;
  const dotSize = size * 0.09;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => {
          const angle = (360 / DOT_COUNT) * i;
          return (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: DOT_COLORS[i % DOT_COLORS.length],
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(${radius - dotSize}px) rotate(-${angle}deg)`,
                transformOrigin: 'center',
              }}
              animate={{ opacity: [1, 0.15] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
                delay: (i / DOT_COUNT) * 1,
              }}
            />
          );
        })}
      </div>
      {label && (
        <p className="text-slate-400 font-medium text-sm tracking-wide">{label}</p>
      )}
    </div>
  );
};

export default Spinner;
