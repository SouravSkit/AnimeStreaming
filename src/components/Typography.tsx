'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  size?: number;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
  align?: 'left' | 'center' | 'right';
  color?: string;
  lines?: number;
  textColor?: string;
  style?: React.CSSProperties;
};

const weightMap = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
};

function Typography({
  children,
  as: Tag = 'p',
  className = '',
  size = 16,
  weight = 'regular',
  align = 'left',
  color,
  textColor,
  lines,
  style: styleProp,
}: Props) {
  const style: React.CSSProperties = {
    fontSize: size,
    textAlign: align,
    ...(color || textColor ? { color: color || textColor } : {}),
    ...(lines
      ? {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }
      : {}),
    ...styleProp,
  };

  return (
    <Tag className={`${weightMap[weight]} font-poppins ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export default Typography;
