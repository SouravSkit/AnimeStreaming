'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  className?: string;
};

function Input({
  value,
  onChange,
  onBlur,
  placeholder = '',
  type = 'text',
  error,
  touched,
  disabled = false,
  className = '',
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isError = error && touched;

  return (
    <div className={`mb-3 w-full ${className}`}>
      <div
        className="relative rounded-xl transition-all duration-300"
        style={{
          boxShadow: focused
            ? '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(0, 212, 255, 0.05)'
            : 'none',
        }}
      >
        {/* Animated border on focus */}
        <div
          className="absolute -inset-[1px] rounded-xl transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #00d4ff)',
            opacity: focused ? 0.5 : 0,
            filter: 'blur(0.5px)',
          }}
        />

        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`relative w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 font-poppins text-sm text-white outline-none transition-all placeholder:text-white/25 ${
            isError
              ? 'border-neon-crimson/50'
              : focused
              ? 'border-transparent'
              : 'border-white/[0.06]'
          }`}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {isError && (
        <p className="mt-1.5 px-2 text-xs text-neon-crimson/80">{error}</p>
      )}
    </div>
  );
}

export default Input;
