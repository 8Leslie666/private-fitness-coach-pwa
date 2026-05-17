import type { PropsWithChildren } from 'react';

type PrimaryButtonProps = PropsWithChildren<{
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}>;

export function PrimaryButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
}: PrimaryButtonProps) {
  const variants = {
    primary:
      'text-white bg-[linear-gradient(145deg,#75A7FF,#3A82F7_54%,#245AB9)] shadow-blue animate-soft-breathe',
    secondary:
      'text-[color:var(--text-main)] bg-white/60 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_12px_26px_rgba(16,23,34,.08)]',
    dark:
      'text-white bg-white/10 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_18px_50px_rgba(0,0,0,.28)]',
    danger:
      'text-white bg-[linear-gradient(145deg,#FB7185,#E5485E)] shadow-[0_14px_34px_rgba(229,72,94,.25)]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pressable min-h-12 rounded-full px-5 text-sm font-semibold ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

