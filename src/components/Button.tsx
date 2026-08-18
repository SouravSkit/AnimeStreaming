'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
};

function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = true,
}: Props) {
  const baseStyles =
    'rounded-2xl px-6 py-3 font-poppins-semibold text-base transition-all duration-200 active:scale-95';

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-gray-200',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    outline:
      'bg-transparent text-text border-2 border-white hover:bg-white hover:text-black',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
