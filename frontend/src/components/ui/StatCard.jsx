import React from 'react';

export function StatCard({ label, value, subLabel, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-white border-slate-200/80 text-slate-800 shadow-sm',
    muted: 'bg-slate-50/80 border-slate-200/60 text-slate-700',
  };
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${variants[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold mt-0.5 tabular-nums">{value}</p>
          {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
        </div>
        {icon && <div className="flex-shrink-0 text-slate-300">{icon}</div>}
      </div>
    </div>
  );
}

export default StatCard;
