'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getByGenre,
  searchTMDB,
  GENRE_IDS,
  type ContentItem,
} from '@/lib/tmdb-client';
import AnimeCard from '@/components/AnimeCard';
import SearchBar from '@/components/SearchBar';
import { ShimmerGrid } from '@/components/ShimmerCard';
import EnergyParticles from '@/components/EnergyParticles';
import { RefreshCw, Sparkles, Flame, Crown, Zap, Star, Film, Tv, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

type Tab = {
  id: string;
  label: string;
  icon: any;
  color: string;
};

const tabs: Tab[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp, color: '#ef4444' },
  { id: 'movies', label: 'Movies', icon: Film, color: '#22d3ee' },
  { id: 'tv', label: 'TV Shows', icon: Tv, color: '#a855f7' },
  { id: 'top', label: 'Top Rated', icon: Star, color: '#f59e0b' },
  { id: 'action', label: 'Action', icon: Flame, color: '#ef4444' },
  { id: 'comedy', label: 'Comedy', icon: Zap, color: '#22d3ee' },
  { id: 'scifi', label: 'Sci-Fi', icon: Crown, color: '#a855f7' },
];

const GENRE_TAB_MAP: Record<string, { genreId: number; mediaType: 'movie' | 'tv' }> = {
  action: { genreId: 28, mediaType: 'movie' },
  comedy: { genreId: 35, mediaType: 'movie' },
  scifi: { genreId: 878, mediaType: 'movie' },
};

function BrowsePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchTabContent = useCallback(
    async (tab: string, pageNum: number, append = false) => {
      try {
        let result;
        switch (tab) {
          case 'trending':
            result = await getTrending();
            break;
          case 'movies':
            result = await getPopularMovies(pageNum);
            break;
          case 'tv':
            result = await getPopularTV(pageNum);
            break;
          case 'top': {
            const [movies, tv] = await Promise.all([
              getTopRatedMovies(pageNum),
              getTopRatedTV(pageNum),
            ]);
            result = {
              results: [...movies.results, ...tv.results].sort(
                (a: ContentItem, b: ContentItem) =>
                  parseFloat(b.rating) - parseFloat(a.rating)
              ),
              hasNextPage: movies.hasNextPage || tv.hasNextPage,
            };
            break;
          }
          default: {
            const genreConfig = GENRE_TAB_MAP[tab];
            if (genreConfig) {
              result = await getByGenre(genreConfig.genreId, genreConfig.mediaType, pageNum);
            } else {
              result = await getTrending();
            }
          }
        }

        const items = result?.results || [];
        if (append) {
          setContent((prev) => [...prev, ...items]);
        } else {
          setContent(items);
        }
      } catch (error) {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Fetch content on tab change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setIsSearching(false);
    setSearchQuery('');
    fetchTabContent(activeTab, 1);
  }, [activeTab, fetchTabContent]);

  // Filter by search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContent(content);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredContent(
        content.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.genres?.some((g) => g.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, content]);

  // Handle search via TMDB API
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setIsSearching(false);
        fetchTabContent(activeTab, 1);
        return;
      }
      setIsSearching(true);
      setLoading(true);
      try {
        const result = await searchTMDB(query);
        setContent(result.results || []);
      } catch (error) {
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 400),
    [activeTab]
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      debouncedSearch(text);
    } else if (!text.trim()) {
      setIsSearching(false);
      fetchTabContent(activeTab, 1);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTabContent(activeTab, nextPage, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTabContent(activeTab, 1);
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
            <p className="text-xs text-white/40">Movies, TV shows, and more</p>
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
          <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search movies, TV shows..." />
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
            {filteredContent.length} {isSearching ? 'search results' : 'titles found'}
          </p>
        </div>

        {/* Content Grid */}
        {loading ? (
          <ShimmerGrid count={12} />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filteredContent.map((item, i) => (
                <AnimeCard
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  releaseDate={item.releaseDate || undefined}
                  rating={item.rating || undefined}
                  mediaType={item.mediaType}
                  href={`/watch/${item.mediaType}/${item.tmdbId}`}
                  index={i}
                />
              ))}
            </div>

            {filteredContent.length === 0 && !loading && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                  <Sparkles size={32} className="text-white/20" />
                </div>
                <p className="text-lg font-medium text-white/40">No content found</p>
                <p className="mt-1 text-sm text-white/20">Try a different search or category</p>
              </div>
            )}

            {/* Load More */}
            {filteredContent.length > 0 && !isSearching && (
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
