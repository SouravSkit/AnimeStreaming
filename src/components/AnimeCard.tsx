'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Typography from './Typography';
import { Play, Star } from 'lucide-react';

type Props = {
  id: string;
  image: string;
  title: string;
  releaseDate?: string;
  rating?: string;
  episodes?: number;
  type?: 'large' | 'medium' | 'small';
  index?: number;
};

function AnimeCard({
  id,
  image,
  title,
  releaseDate,
  rating,
  episodes,
  type = 'medium',
  index = 0,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const sizeClasses = {
    large: 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4',
    medium: 'w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5',
    small: 'w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6',
  };

  return (
    <Link href={`/anime/${id}`} className="block p-2">
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ${sizeClasses[type]}`}
        style={{
          animation: `slide-up 0.6s ease-out ${index * 0.05}s both`,
        }}
      >
        {/* Card Container */}
        <div
          className="relative aspect-[2/3] overflow-hidden rounded-2xl"
          style={{
            transform: isHovered ? 'translateY(-8px) scale(1.03)' : 'none',
            boxShadow: isHovered
              ? '0 20px 50px rgba(168, 85, 247, 0.3), 0 0 30px rgba(0, 212, 255, 0.15)'
              : '0 4px 20px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {/* Image */}
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
            loading="lazy"
          />

          {/* Hover spotlight effect */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(168, 85, 247, 0.2), transparent 60%)`,
              }}
            />
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Neon border on hover */}
          <div
            className="absolute inset-0 rounded-2xl border-2 transition-opacity duration-500"
            style={{
              borderColor: isHovered
                ? 'rgba(168, 85, 247, 0.5)'
                : 'transparent',
              opacity: isHovered ? 1 : 0,
              boxShadow: isHovered
                ? 'inset 0 0 20px rgba(168, 85, 247, 0.1)'
                : 'none',
            }}
          />

          {/* Play button overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.5)',
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neon-purple/80 backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <Play size={24} className="ml-1 fill-white text-white" />
            </div>
          </div>

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
              <Star size={10} className="fill-neon-gold text-neon-gold" />
              <span className="text-[10px] font-semibold text-neon-gold">{rating}</span>
            </div>
          )}

          {/* Content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <Typography
              size={13}
              weight="semibold"
              lines={2}
              className="text-white transition-colors duration-300"
              style={{
                textShadow: isHovered ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none',
              }}
            >
              {title}
            </Typography>

            <div className="mt-1 flex items-center gap-2">
              {releaseDate && (
                <Typography size={11} color="#9ca3af">
                  {releaseDate}
                </Typography>
              )}
              {episodes && (
                <Typography size={11} color="#a855f7">
                  {episodes} EP
                </Typography>
              )}
            </div>
          </div>

          {/* Top glow line on hover */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, #a855f7, #00d4ff, transparent)',
              opacity: isHovered ? 1 : 0,
              filter: 'blur(1px)',
            }}
          />
        </div>
      </div>
    </Link>
  );
}

export default AnimeCard;
