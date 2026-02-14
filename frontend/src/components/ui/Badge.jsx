import React from 'react';

const variantStyles = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  fixed: 'bg-blue-100 text-blue-800 border-blue-200',
  verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function Badge({ children, variant = 'default', className = '' }) {
  const style = variantStyles[variant.toLowerCase()] || variantStyles.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
