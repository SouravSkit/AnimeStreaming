'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTopAiring, getGenreData, getPopularAnime, getRecentNews, GENRES } from '@/lib/anime';
import HeroBanner from '@/components/HeroBanner';
import GenreSection from '@/components/GenreSection';
import SectionHeader from '@/components/SectionHeader';
import AnimeCard from '@/components/AnimeCard';
import EnergyParticles from '@/components/EnergyParticles';
import { ShimmerHero, ShimmerGrid } from '@/components/ShimmerCard';
import Typography from '@/components/Typography';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Flame, Crown, Sparkles, Zap, Star, TrendingUp, Clock, Layers } from 'lucide-react';

type AnimeItem = {
  id: string;
  image: string;
  title: string;
  description?: string;
  genres?: string[];
  rating?: string;
  releaseDate?: string;
  totalEpisodes?: number;
};

type GenreData = Record<string, { results: AnimeItem[] }>;

function HomePageContent() {
  const [topAiring, setTopAiring] = useState<AnimeItem[]>([]);
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [genreData, setGenreData] = useState<GenreData>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [topResult, popularResult] = await Promise.allSettled([
        getTopAiring(),
        getPopularAnime(1),
      ]);

      if (topResult.status === 'fulfilled') {
        const items = topResult.value?.results || [];
        setTopAiring(items);
      }
      if (popularResult.status === 'fulfilled') {
        setPopular(popularResult.value?.results || []);
      }

      const genreResults = await Promise.allSettled(
        GENRES.map(async (genre) => {
          const data = await getGenreData(genre);
          return { genre, data };
        })
      );

      const newGenreData: GenreData = {};
      genreResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          newGenreData[result.value.genre] = result.value.data;
        }
      });
      setGenreData(newGenreData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Special genre categories
  const specialSections = [
    { key: 'action', title: 'Beast Mode', icon: Flame, color: '#ef4444', subtitle: 'Powerful warriors and legendary battles' },
    { key: 'fantasy', title: 'Legendary Classics', icon: Crown, color: '#f59e0b', subtitle: 'Timeless tales of wonder and adventure' },
    { key: 'thriller', title: 'Shonen Favorites', icon: Zap, color: '#a855f7', subtitle: 'Edge-of-your-seat action and drama' },
    { key: 'romance', title: 'Most Popular', icon: Star, color: '#ec4899', subtitle: 'Fan favorites and top-rated series' },
  ];

  return (
    <div className="min-h-screen bg-deep">
      {/* Hero Section */}
      {loading ? (
        <ShimmerHero />
      ) : (
        topAiring.length > 0 && <HeroBanner data={topAiring} />
      )}

      {/* Main Content */}
      <div className="relative mx-auto max-w-[1400px] px-4 pb-32 pt-4">
        {/* Ambient particles in content area */}
        <EnergyParticles count={15} color="#a855f7" speed="slow" className="opacity-30" />

        {/* Trending Now Section */}
        {topAiring.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Trending Now"
              subtitle="Currently hot in the anime world"
              accentColor="#ef4444"
              viewAllHref="/browse"
            />
            <div className="flex flex-wrap">
              {topAiring.slice(0, 10).map((item, i) => (
                <AnimeCard
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* New Releases */}
        {popular.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="New Releases"
              subtitle="Fresh anime just added"
              accentColor="#22d3ee"
              viewAllHref="/browse"
            />
            <div className="flex flex-wrap">
              {popular.slice(0, 10).map((item, i) => (
                <AnimeCard
                  key={`popular-${item.id}`}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Special Curated Sections */}
        {specialSections.map(({ key, title, icon: Icon, color, subtitle }) => (
          genreData[key]?.results && (
            <section key={key} className="mb-12">
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-wide text-white">{title}</h2>
                    <p className="text-xs text-white/40">{subtitle}</p>
                  </div>
                </div>
                <Link
                  href="/browse"
                  className="text-xs font-medium text-white/50 transition-colors hover:text-white"
                >
                  View All →
                </Link>
              </div>
              <div className="flex flex-wrap">
                {genreData[key].results.slice(0, 10).map((item, i) => (
                  <AnimeCard
                    key={`special-${key}-${item.id}`}
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    rating={item.rating}
                    releaseDate={item.releaseDate}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )
        ))}

        {/* All Genre Sections */}
        <section className="mt-16">
          <SectionHeader
            title="Browse by Genre"
            subtitle="Explore anime by your favorite genres"
            accentColor="#6366f1"
          />

          {loading ? (
            <div className="py-10">
              <ShimmerGrid count={12} />
            </div>
          ) : (
            GENRES.map((genre) => (
              <GenreSection
                key={genre}
                genre={genre}
                data={genreData[genre]?.results || []}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePageContent;
