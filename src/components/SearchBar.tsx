'use client';

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

function SearchBar({ value, onChange, placeholder = 'Search anime...', autoFocus = false, className = '' }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative transition-all duration-500 ${className}`}
      style={{
        boxShadow: focused
          ? '0 0 30px rgba(168, 85, 247, 0.2), 0 0 60px rgba(0, 212, 255, 0.1)'
          : 'none',
      }}
    >
      {/* Animated border */}
      <div
        className="absolute -inset-[1px] rounded-2xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #a855f7, #00d4ff, #a855f7)',
          backgroundSize: '300% 300%',
          animation: focused ? 'gradient-shift 3s ease infinite' : 'none',
          opacity: focused ? 1 : 0,
          filter: 'blur(1px)',
        }}
      />

      {/* Input container */}
      <div className="relative flex items-center rounded-2xl bg-deep-alt/80 px-5 py-3.5 backdrop-blur-xl">
        <Search
          size={20}
          className={`mr-3 transition-colors duration-300 ${
            focused ? 'text-neon-purple' : 'text-white/40'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/30"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="ml-2 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
