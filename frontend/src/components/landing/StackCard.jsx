import React from 'react';
import { motion } from 'framer-motion';

/**
 * Single card in the stacked folder. Receives motion style from parent (useTransform).
 */
export function StackCard({ children, style, className = '', isReducedMotion }) {
  const sharedClasses =
    'bg-white rounded-xl border border-brand-navy/10 overflow-hidden flex flex-col shadow-sm';
  const paperEdge = 'border-t border-brand-navy/5 bg-brand-bg/30 min-h-0';

  if (isReducedMotion) {
    return (
      <div className={`${sharedClasses} ${className}`}>
        <div className={`flex-1 p-6 flex flex-col ${paperEdge}`}>{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${sharedClasses} ${className}`}
      style={{
        ...style,
        transformOrigin: 'center bottom',
      }}
    >
      <div className={`flex-1 p-6 flex flex-col min-h-0 ${paperEdge}`}>{children}</div>
    </motion.div>
  );
}
