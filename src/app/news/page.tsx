'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getRecentNews } from '@/lib/anime';
import Typography from '@/components/Typography';
import EnergyParticles from '@/components/EnergyParticles';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

type NewsItem = {
  id: string;
  title: string;
  thumbnail: string;
  uploadedAt: string;
  content?: string;
};

function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getRecentNews();
        setNews(data?.data || []);
      } catch (error) {
        toast.error('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % news.length;
        scrollToCard(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[index] as HTMLElement;
    if (card) {
      const scrollLeft = card.offsetLeft - scrollRef.current.offsetWidth / 2 + card.offsetWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const next = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (next >= 0 && next < news.length) {
      setCurrentIndex(next);
      scrollToCard(next);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-purple/30 border-t-neon-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-deep overflow-hidden">
      {/* Background with current news image */}
      {news.length > 0 && (
        <div className="fixed inset-0 z-0 transition-all duration-1000">
          <img
            src={news[currentIndex]?.thumbnail}
            alt=""
            className="h-full w-full object-cover opacity-10 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep/80 via-deep/60 to-deep" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep via-transparent to-deep" />
        </div>
      )}

      {/* Particles */}
      <EnergyParticles count={20} color="#f59e0b" speed="slow" className="opacity-15 z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 sm:px-12">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.1))',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <Newspaper size={18} className="text-neon-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Anime News</h1>
              <p className="text-xs text-white/40">Latest updates from the anime world</p>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-cinematic px-8"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {news.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={item.id || index}
                  className="flex-shrink-0 snap-center transition-all duration-700"
                  style={{
                    width: isActive ? 'min(72vw, 600px)' : 'min(60vw, 450px)',
                    opacity: isActive ? 1 : 0.4,
                    transform: isActive ? 'scale(1)' : 'scale(0.85)',
                  }}
                  onClick={() => {
                    setCurrentIndex(index);
                    scrollToCard(index);
                  }}
                >
                  <div
                    className="overflow-hidden rounded-3xl transition-all duration-500"
                    style={{
                      boxShadow: isActive
                        ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.15)'
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                      border: isActive ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="glass-strong p-5">
                      <Typography size={12} weight="semibold" color="#f59e0b">
                        {item.uploadedAt}
                      </Typography>
                      <Typography size={15} weight="semibold" className="mt-2" align={isActive ? 'left' : 'center'}>
                        {item.title}
                      </Typography>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="mt-8 flex items-center gap-6">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {news.slice(0, Math.min(news.length, 15)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    scrollToCard(i);
                  }}
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: i === currentIndex ? 24 : 8,
                    background: i === currentIndex
                      ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: i === currentIndex ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              disabled={currentIndex === news.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
