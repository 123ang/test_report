import { useState, useEffect } from 'react';

const OFFSET = 120;

/**
 * Returns the id of the section currently in view (for TOC highlight).
 * @param {string[]} sectionIds - Array of section element ids
 */
export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null);

  useEffect(() => {
    if (!sectionIds.length) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const handleScroll = () => {
      const top = window.scrollY + OFFSET;
      let current = null;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const elTop = rect.top + window.scrollY;
        if (elTop <= top) current = el.id;
      }
      if (current) setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds.join(',')]);

  return activeId;
}
