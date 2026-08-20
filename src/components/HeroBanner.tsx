'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Typography from './Typography';
import EnergyParticles from './EnergyParticles';
import CinematicBurst from './CinematicBurst';
import { Play, Plus, Info, Star, Clock, Calendar, Film, Tv } from 'lucide-react';

type HeroItem = {
  id: string;
  tmdbId?: number;
  image: string;
  backdrop?: string;
  title: string;
  description?: string;
  genres?: string[];
  rating?: string;
  releaseDate?: string;
  totalEpisodes?: number;
  mediaType?: 'movie' | 'tv';
};

type Props = {
  data: HeroItem[];
};

function HeroBanner({ data }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const currentItem = data[currentIndex];

  // Auto-rotate
  useEffect(() => {
    if (!data || data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [data?.length]);

  // Parallax mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleWatchNow = () => {
    setBurstActive(true);
  };

  if (!currentItem) return null;

  // Determine watch link — TMDB content goes to /watch, legacy anime goes to /anime
  const watchHref = currentItem.tmdbId && currentItem.mediaType
    ? `/watch/${currentItem.mediaType}/${currentItem.tmdbId}`
    : `/anime/${currentItem.id}`;

  // Best background image: prefer backdrop, fallback to poster
  const heroImage = currentItem.backdrop || currentItem.image;

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden"
    >
      <CinematicBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      {/* === BACKGROUND LAYERS === */}

      {/* Base background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-deep-alt to-deep" />

      {/* Hero image with parallax */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-out"
        style={{
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px) scale(1.15)`,
        }}
      >
        <img
          src={heroImage}
          alt={currentItem.title}
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* Dark overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-deep/50 via-transparent to-deep" />

      {/* Atmospheric fog */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-deep to-transparent" />

      {/* Animated light rays */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-1/4 h-full w-[1px] bg-gradient-to-b from-neon-purple via-transparent to-transparent"
          style={{ filter: 'blur(8px)', animation: 'flicker 4s infinite' }}
        />
        <div
          className="absolute top-0 right-1/3 h-full w-[1px] bg-gradient-to-b from-neon-blue via-transparent to-transparent"
          style={{ filter: 'blur(6px)', animation: 'flicker 5s infinite 1s' }}
        />
      </div>

      {/* Energy particles */}
      <EnergyParticles count={25} color="#a855f7" speed="slow" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,0,20,0.4)_70%,rgba(3,0,20,0.9)_100%)]" />

      {/* === CONTENT === */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-28 sm:px-12 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {/* Media type badge */}
          {currentItem.mediaType && (
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                currentItem.mediaType === 'movie'
                  ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                  : 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
              }`}>
                {currentItem.mediaType === 'movie' ? <Film size={12} /> : <Tv size={12} />}
                {currentItem.mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>
            </div>
          )}

          {/* Genre tags */}
          {currentItem.genres && currentItem.genres.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {currentItem.genres.slice(0, 4).map((genre, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="hero-title text-3xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              animation: 'slide-up 0.8s ease-out forwards',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.3), 0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span className="gradient-text">{currentItem.title}</span>
          </h1>

          {/* Meta info */}
          <div
            className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300"
            style={{ animation: 'slide-up 0.8s ease-out 0.1s both' }}
          >
            {currentItem.rating && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-neon-gold fill-neon-gold" />
                <span className="text-neon-gold font-semibold">{currentItem.rating}</span>
              </span>
            )}
            {currentItem.releaseDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-neon-cyan" />
                {currentItem.releaseDate}
              </span>
            )}
            {currentItem.totalEpisodes && (
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-neon-purple" />
                {currentItem.totalEpisodes} Episodes
              </span>
            )}
          </div>

          {/* Description */}
          {currentItem.description && (
            <p
              className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300/80 line-clamp-3"
              style={{ animation: 'slide-up 0.8s ease-out 0.2s both' }}
            >
              {currentItem.description}
            </p>
          )}

          {/* Buttons */}
          <div
            className="mt-8 flex flex-wrap gap-4"
            style={{ animation: 'slide-up 0.8s ease-out 0.3s both' }}
          >
            <Link href={watchHref} onClick={handleWatchNow}>
              <button className="btn-cinematic flex items-center gap-2 rounded-2xl px-8 py-3.5 font-poppins font-semibold text-white">
                <Play size={18} className="fill-white" />
                Watch Now
              </button>
            </Link>
            <button className="btn-outline-cinematic flex items-center gap-2 rounded-2xl px-6 py-3.5 font-poppins font-medium text-white">
              <Plus size={18} />
              Add to List
            </button>
            <button className="btn-outline-cinematic flex items-center gap-2 rounded-2xl px-6 py-3.5 font-poppins font-medium text-white">
              <Info size={18} />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* === SIDE INDICATORS === */}
      <div className="absolute right-6 bottom-32 z-10 flex flex-col gap-3 sm:right-12 md:right-16 lg:right-24">
        {data.slice(0, Math.min(data.length, 8)).map((item, i) => (
          <button
            key={item.id || i}
            onClick={() => setCurrentIndex(i)}
            className="group relative"
          >
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? 'w-10 bg-gradient-to-r from-neon-purple to-neon-blue shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'w-4 bg-white/20 hover:bg-white/40'
              }`}
            />
          </button>
        ))}
      </div>

      {/* === COUNTER === */}
      <div className="absolute bottom-8 left-6 z-10 sm:left-12 md:left-16 lg:left-24">
        <span className="text-xs text-white/40">
          <span className="font-semibold text-white/70">{currentIndex + 1}</span>
          {' / '}
          {data.length}
        </span>
      </div>
    </div>
  );
}

export default HeroBanner;
