import React from 'react';

/**
 * Single full-bleed global background layer for the page.
 * Renders behind all content (z-index -1), no max-width — prevents section "cuts" and clipping.
 */
export function PageBackground() {
  return (
    <div
      className="page-bg-global"
      aria-hidden
    />
  );
}
