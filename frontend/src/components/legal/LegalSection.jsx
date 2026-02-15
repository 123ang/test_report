import React from 'react';
import { motion } from 'framer-motion';

/**
 * Section wrapper with id for anchor + subtle scroll-in animation.
 */
export function LegalSection({ id, children, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`py-8 border-b border-brand-navy/5 last:border-b-0 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px 0px 0px 0px' }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.section>
  );
}
