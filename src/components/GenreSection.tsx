'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Typography from './Typography';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AnimeItem = {
  id: string;
  image: string;
  title: string;
  rating?: string;
};

type Props = {
  genre: string;
  data: AnimeItem[];
  accentColor?: string;
};

const genreColors: Record<string, string> = {
  action: '#ef4444',
  adventure: '#f97316',
  comedy: '#f59e0b',
  crime: '#6b7280',
  drama: '#a855f7',
  family: '#10b981',
  fantasy: '#6366f1',
  kids: '#22d3ee',
  music: '#ec4899',
  mystery: '#8b5cf6',
  romance: '#f43f5e',
  school: '#14b8a6',
  sports: '#3b82f6',
  survival: '#84cc16',
  thriller: '#dc2626',
  workplace: '#78716c',
};

function GenreSection({ genre, data, accentColor }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const color = accentColor || genreColors[genre] || '#a855f7';

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="mb-10 animate-slide-up">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color}, transparent)`,
              boxShadow: `0 0 10px ${color}44`,
            }}
          />
          <h2 className="text-lg font-bold capitalize tracking-wide text-white">
            {genre}
          </h2>
        </div>

        {/* Scroll Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Genre accent gradient */}
      <div
        className="mb-4 h-[1px] opacity-30"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="scroll-cinematic flex gap-3 overflow-x-auto pb-4"
      >
        {data.map((item, i) => (
          <Link
            key={item.id}
            href={`/anime/${item.id}`}
            className="group relative flex-shrink-0"
            style={{ width: 180 }}
          >
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-xl transition-all duration-500"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Genre color accent on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300 group-hover:opacity-100 opacity-0"
                style={{
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <Typography size={12} weight="semibold" lines={2}>
                  {item.title}
                </Typography>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default GenreSection;
