'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchTMDB, type ContentItem } from '@/lib/tmdb-client';
import SearchBar from '@/components/SearchBar';
import EnergyParticles from '@/components/EnergyParticles';
import Typography from '@/components/Typography';
import { ArrowLeft, Play, Sparkles, Film, Tv } from 'lucide-react';
import debounce from 'lodash.debounce';

function SearchPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchTMDB(query, 1);
        setResults(data.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 bg-gradient-radial from-neon-purple/5 to-transparent" />
        <EnergyParticles count={15} color="#00d4ff" speed="slow" className="opacity-15" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-6 pb-32">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchText}
            onChange={handleSearch}
            placeholder="Search for movies, TV shows..."
            autoFocus
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-purple/30 border-t-neon-purple" />
              <div className="absolute inset-0 animate-pulse rounded-full border border-neon-purple/20" />
            </div>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center py-20">
            <div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.05))',
                border: '1px solid rgba(168, 85, 247, 0.15)',
              }}
            >
              <Sparkles size={40} className="text-neon-purple/40" />
            </div>
            <h2 className="text-xl font-bold text-white/60">Search for Content</h2>
            <p className="mt-2 text-sm text-white/30">Find movies, TV shows, and more</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Sparkles size={40} className="text-white/20" />
            </div>
            <h2 className="text-xl font-bold text-white/40">No results found</h2>
            <p className="mt-2 text-sm text-white/20">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-white/30">
              {results.length} results found
            </p>
            {results.map((item, i) => (
              <Link
                key={item.id}
                href={`/watch/${item.mediaType}/${item.tmdbId}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-300 hover:border-neon-purple/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                style={{ animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="relative h-[91px] w-[91px] flex-shrink-0 overflow-hidden rounded-xl bg-deep-alt">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {item.mediaType === 'movie' ? (
                        <Film size={24} className="text-white/20" />
                      ) : (
                        <Tv size={24} className="text-white/20" />
                      )}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Play size={24} className="fill-white text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white transition-colors group-hover:text-neon-purple line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    {item.releaseDate && (
                      <p className="text-xs text-white/30">{item.releaseDate}</p>
                    )}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.mediaType === 'movie'
                        ? 'bg-neon-blue/10 text-neon-blue'
                        : 'bg-neon-purple/10 text-neon-purple'
                    }`}>
                      {item.mediaType === 'movie' ? <Film size={8} /> : <Tv size={8} />}
                      {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                    </span>
                    {item.rating && (
                      <span className="text-[10px] text-neon-gold">★ {item.rating}</span>
                    )}
                  </div>
                  {item.genres && item.genres.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.genres.slice(0, 3).map((genre, j) => (
                        <span key={j} className="text-[10px] text-white/20">
                          {genre}{j < Math.min(item.genres.length, 3) - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-white/20 transition-colors group-hover:text-neon-purple">
                  <Play size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
