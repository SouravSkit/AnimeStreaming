'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTrending, getByGenre, getPopularMovies, getPopularTV, type ContentItem } from '@/lib/tmdb-client';
import HeroBanner from '@/components/HeroBanner';
import SectionHeader from '@/components/SectionHeader';
import AnimeCard from '@/components/AnimeCard';
import EnergyParticles from '@/components/EnergyParticles';
import { ShimmerHero, ShimmerGrid } from '@/components/ShimmerCard';
import Typography from '@/components/Typography';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Flame, Crown, Sparkles, Zap, Star, Film, Tv, TrendingUp } from 'lucide-react';

type Section = {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  items: ContentItem[];
};

function HomePageContent() {
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<ContentItem[]>([]);
  const [popularTV, setPopularTV] = useState<ContentItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch trending, popular movies, popular TV, and genre sections in parallel
      const [trendingRes, moviesRes, tvRes, actionRes, comedyRes, sciFiRes, dramaRes] =
        await Promise.allSettled([
          getTrending(),
          getPopularMovies(),
          getPopularTV(),
          getByGenre(28, 'movie'),  // Action
          getByGenre(35, 'movie'),  // Comedy
          getByGenre(878, 'movie'), // Sci-Fi
          getByGenre(18, 'tv'),     // Drama
        ]);

      if (trendingRes.status === 'fulfilled') setTrending(trendingRes.value.results || []);
      if (moviesRes.status === 'fulfilled') setPopularMovies(moviesRes.value.results || []);
      if (tvRes.status === 'fulfilled') setPopularTV(tvRes.value.results || []);

      const genreSections: Section[] = [];
      if (actionRes.status === 'fulfilled' && actionRes.value.results.length > 0) {
        genreSections.push({
          title: 'Action & Thrills',
          subtitle: 'Edge-of-your-seat excitement',
          icon: Flame,
          color: '#ef4444',
          items: actionRes.value.results.slice(0, 12),
        });
      }
      if (comedyRes.status === 'fulfilled' && comedyRes.value.results.length > 0) {
        genreSections.push({
          title: 'Comedy Picks',
          subtitle: 'Lighthearted fun for everyone',
          icon: Sparkles,
          color: '#22d3ee',
          items: comedyRes.value.results.slice(0, 12),
        });
      }
      if (sciFiRes.status === 'fulfilled' && sciFiRes.value.results.length > 0) {
        genreSections.push({
          title: 'Sci-Fi & Fantasy',
          subtitle: 'Beyond the stars and imagination',
          icon: Crown,
          color: '#a855f7',
          items: sciFiRes.value.results.slice(0, 12),
        });
      }
      if (dramaRes.status === 'fulfilled' && dramaRes.value.results.length > 0) {
        genreSections.push({
          title: 'Top Drama Series',
          subtitle: 'Award-winning storytelling',
          icon: Star,
          color: '#f59e0b',
          items: dramaRes.value.results.slice(0, 12),
        });
      }
      setSections(genreSections);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-deep">
      {/* Hero Section */}
      {loading ? (
        <ShimmerHero />
      ) : (
        trending.length > 0 && <HeroBanner data={trending} />
      )}

      {/* Main Content */}
      <div className="relative mx-auto max-w-none px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-28 pb-32 pt-4">
        <EnergyParticles count={15} color="#a855f7" speed="slow" className="opacity-30" />

        {/* Trending Now */}
        {trending.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Trending Now"
              subtitle="What's hot this week"
              accentColor="#ef4444"
              viewAllHref="/browse"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
              {trending.slice(0, 14).map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies */}
        {popularMovies.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Popular Movies"
              subtitle="Must-watch films right now"
              accentColor="#22d3ee"
              viewAllHref="/browse?tab=movies"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
              {popularMovies.slice(0, 14).map((item, i) => (
                <ContentCard key={`movie-${item.id}`} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Popular TV Shows */}
        {popularTV.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Popular TV Shows"
              subtitle="Binge-worthy series everyone loves"
              accentColor="#a855f7"
              viewAllHref="/browse?tab=tv"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
              {popularTV.slice(0, 14).map((item, i) => (
                <ContentCard key={`tv-${item.id}`} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Genre Sections */}
        {sections.map((section, idx) => (
          <section key={idx} className="mb-12">
            <div className="mb-5 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: `${section.color}15`,
                    border: `1px solid ${section.color}33`,
                  }}
                >
                  <section.icon size={18} style={{ color: section.color }} />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-wide text-white">{section.title}</h2>
                  <p className="text-xs lg:text-sm text-white/40">{section.subtitle}</p>
                </div>
              </div>
              <Link
                href="/browse"
                className="text-xs font-medium text-white/50 transition-colors hover:text-white"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
              {section.items.map((item, i) => (
                <ContentCard key={`section-${idx}-${item.id}`} item={item} index={i} />
              ))}
            </div>
          </section>
        ))}

        {/* Loading state for genre sections */}
        {loading && (
          <section className="mt-16">
            <ShimmerGrid count={12} />
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Content card that links to the detail page with correct TMDB data.
 */
function ContentCard({ item, index }: { item: ContentItem; index: number }) {
  return (
    <Link href={`/watch/${item.mediaType}/${item.tmdbId}`} className="block">
      <AnimeCard
        id={item.id}
        image={item.image}
        title={item.title}
        rating={item.rating || undefined}
        releaseDate={item.releaseDate || undefined}
        index={index}
      />
    </Link>
  );
}

export default HomePageContent;
