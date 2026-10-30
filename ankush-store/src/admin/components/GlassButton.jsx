import React from 'react';

export default function GlassButton({
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  onClick,
  className = '',
  title,
  type = 'button'
}) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B16] disabled:opacity-40 disabled:pointer-events-none overflow-hidden group cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-sm px-5 py-3 rounded-2xl gap-2.5',
    icon: 'p-2.5 rounded-2xl',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#4F46E5] text-white shadow-[0_8px_25px_-4px_rgba(139,92,246,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(139,92,246,0.7),inset_0_1px_2px_rgba(255,255,255,0.55)] hover:-translate-y-0.5 active:translate-y-0 border border-violet-300/30',
    secondary:
      'bg-[#131A33]/75 hover:bg-[#1C2547]/85 text-[#F8FAFC] backdrop-blur-xl border border-white/12 hover:border-violet-400/40 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.16)] hover:-translate-y-0.5 active:translate-y-0',
    tertiary:
      'bg-transparent hover:bg-white/[0.06] text-[#A5B4CC] hover:text-[#F8FAFC] border border-transparent hover:border-white/10',
    icon:
      'bg-[#131A33]/70 hover:bg-[#1E294E]/80 text-[#A5B4CC] hover:text-[#F8FAFC] backdrop-blur-xl border border-white/10 hover:border-cyan-300/35 shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-400/30 hover:border-rose-400/50 shadow-[0_8px_20px_-6px_rgba(251,113,133,0.35),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      )}
      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-105" />}
      {children && <span className="relative z-10 tracking-tight">{children}</span>}
      {IconRight && <IconRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </button>
  );
}
