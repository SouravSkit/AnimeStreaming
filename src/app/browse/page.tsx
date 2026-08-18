'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPopularAnime, GENRES, getGenreData } from '@/lib/anime';
import AnimeCard from '@/components/AnimeCard';
import SearchBar from '@/components/SearchBar';
import { ShimmerGrid } from '@/components/ShimmerCard';
import EnergyParticles from '@/components/EnergyParticles';
import Typography from '@/components/Typography';
import { RefreshCw, Sparkles, Flame, Crown, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type AnimeData = {
  id: string;
  image: string;
  title: string;
  releaseDate?: string;
  rating?: string;
};

const tabs = [
  { id: 'all', label: 'All', icon: Sparkles, color: '#a855f7' },
  { id: 'action', label: 'Action', icon: Flame, color: '#ef4444' },
  { id: 'fantasy', label: 'Fantasy', icon: Crown, color: '#6366f1' },
  { id: 'romance', label: 'Romance', icon: Star, color: '#ec4899' },
  { id: 'comedy', label: 'Comedy', icon: Zap, color: '#f59e0b' },
];

function BrowsePage() {
  const router = useRouter();
  const [animeData, setAnimeData] = useState<AnimeData[]>([]);
  const [filteredData, setFilteredData] = useState<AnimeData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const result = await getPopularAnime(pageNum);
        const results = result?.results || [];
        if (append) {
          setAnimeData((prev) => [...prev, ...results]);
        } else {
          setAnimeData(results);
        }
      } catch (error) {
        toast.error('Failed to load anime');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Filter by search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(animeData);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredData(
        animeData.filter(
          (item) =>
            item.title.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, animeData]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData(1);
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-gradient-radial from-neon-purple/5 to-transparent" />
        <EnergyParticles count={15} color="#a855f7" speed="slow" className="opacity-15" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-6 pb-32">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Explore</h1>
            <p className="text-xs text-white/40">Discover your next favorite anime</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-all hover:border-neon-purple/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex gap-3 overflow-x-auto scroll-cinematic pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  background: isActive ? `${tab.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? `${tab.color}44` : 'rgba(255,255,255,0.06)'}`,
                  color: isActive ? tab.color : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? `0 0 20px ${tab.color}22` : 'none',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-white/30">
            {filteredData.length} anime found
          </p>
        </div>

        {/* Anime Grid */}
        {loading ? (
          <ShimmerGrid count={12} />
        ) : (
          <>
            <div className="flex flex-wrap">
              {filteredData.map((item, i) => (
                <AnimeCard
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  releaseDate={item.releaseDate}
                  rating={item.rating}
                  index={i}
                />
              ))}
            </div>

            {filteredData.length === 0 && !loading && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                  <Sparkles size={32} className="text-white/20" />
                </div>
                <p className="text-lg font-medium text-white/40">No anime found</p>
                <p className="mt-1 text-sm text-white/20">Try a different search or category</p>
              </div>
            )}

            {/* Load More */}
            {filteredData.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="btn-outline-cinematic rounded-2xl px-8 py-3.5 font-medium text-white"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;
