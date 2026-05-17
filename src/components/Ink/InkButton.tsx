import type { ButtonHTMLAttributes, ReactNode } from 'react';

type InkButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'seal';

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: InkButtonVariant;
  children: ReactNode;
}

const variants: Record<InkButtonVariant, string> = {
  primary: 'bg-ink text-white shadow-ink',
  secondary: 'bg-white/82 text-ink shadow-soft border border-white/80',
  ghost: 'bg-inkwash text-ink',
  danger: 'bg-red-50 text-red-700',
  seal: 'bg-seal text-white shadow-soft',
};

export function InkButton({ variant = 'primary', className = '', children, ...props }: InkButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-[52px] rounded-[20px] px-4 text-sm font-semibold transition active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
