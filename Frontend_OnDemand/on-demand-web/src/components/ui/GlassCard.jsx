// components/ui/GlassCard.jsx
'use client';
export function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      bg-white/80 backdrop-blur-lg border border-white/20 
      shadow-lg shadow-teal-500/5
      ${hover ? 'hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-200/50' : ''}
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}