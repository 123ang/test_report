import React from 'react';

/**
 * Table of contents with anchor links. Highlights active section (soft blue underline).
 */
export function TableOfContents({ items, activeId }) {
  return (
    <nav className="mb-12 pb-8 border-b border-brand-navy/10" aria-label="Table of contents">
      <p className="text-xs font-medium text-brand-navy/50 uppercase tracking-wider mb-4">
        On this page
      </p>
      <ul className="space-y-2">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm py-1 transition-colors ${
                activeId === id
                  ? 'text-brand-accent font-medium border-l-2 border-brand-accent pl-3 -ml-px'
                  : 'text-brand-navy/60 hover:text-brand-navy pl-3 border-l-2 border-transparent'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
