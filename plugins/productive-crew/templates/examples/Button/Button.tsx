import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// Every value comes from a semantic token — never a raw hex or px.
export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        background: variant === 'primary' ? 'var(--bg-primary)' : 'transparent',
        color: variant === 'primary' ? 'var(--text-on-primary)' : 'var(--text-base)',
        padding: 'var(--space-4)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
    />
  );
}
