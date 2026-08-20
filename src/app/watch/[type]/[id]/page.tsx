'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getDetails,
  getSeasonDetails,
  searchYouTube,
  posterUrl,
  type ContentDetail,
  type ContentItem,
} from '@/lib/tmdb-client';
import Typography from '@/components/Typography';
import CinematicBurst from '@/components/CinematicBurst';
import {
  ArrowLeft,
  Play,
  Star,
  Calendar,
  Clock,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
  Loader,
  Film,
  Tv,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Episode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
};

type YouTubeResult = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  views: string;
  embedUrl: string;
};

function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const mediaType = params.type as 'movie' | 'tv';
  const tmdbId = parseInt(params.id as string, 10);

  const [details, setDetails] = useState<ContentDetail | null>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showDescription, setShowDescription] = useState(true);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeResult | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Fetch content details
  useEffect(() => {
    if (!tmdbId || !mediaType) return;
    const fetchDetails = async () => {
      try {
        const data = await getDetails(tmdbId, mediaType);
        setDetails(data);
      } catch (error) {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [tmdbId, mediaType]);

  // Fetch season episodes for TV shows
  const fetchSeason = useCallback(
    async (seasonNum: number) => {
      if (mediaType !== 'tv' || !tmdbId) return;
      setSeasonLoading(true);
      try {
        const data = await getSeasonDetails(tmdbId, seasonNum);
        setEpisodes(data.episodes || []);
        if (data.episodes?.length > 0) {
          setSelectedEpisode(data.episodes[0]);
        }
      } catch (error) {
        console.error('Failed to load season:', error);
      } finally {
        setSeasonLoading(false);
      }
    },
    [tmdbId, mediaType]
  );

  useEffect(() => {
    fetchSeason(currentSeason);
  }, [currentSeason, fetchSeason]);

  // Search YouTube for playable content
  const findAndPlayVideo = useCallback(
    async (query: string) => {
      setStreamLoading(true);
      setYoutubeResults([]);
      setSelectedVideo(null);
      try {
        const data = await searchYouTube(query, 10);
        const results = data.results || [];
        setYoutubeResults(results);
        if (results.length > 0) {
          setSelectedVideo(results[0]);
        }
      } catch (error) {
        console.error('YouTube search failed:', error);
        toast.error('Failed to find playable video');
      } finally {
        setStreamLoading(false);
      }
    },
    []
  );

  // Handle play button click
  const handlePlay = () => {
    if (isPlaying && selectedVideo) return;
    setBurstActive(true);

    let searchQuery = '';
    if (mediaType === 'movie') {
      searchQuery = `${details?.title || ''} ${details?.releaseDate || ''} full movie`;
    } else if (selectedEpisode) {
      searchQuery = `${details?.title || ''} ${selectedEpisode.name} S${currentSeason}E${selectedEpisode.episode_number}`;
    } else {
      searchQuery = `${details?.title || ''} official trailer`;
    }

    setTimeout(() => {
      findAndPlayVideo(searchQuery);
      setIsPlaying(true);
    }, 600);
  };

  // Handle episode click for TV shows
  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(false);
    setSelectedVideo(null);
  };

  // Auto-play when episode changes
  useEffect(() => {
    if (isPlaying && selectedEpisode && mediaType === 'tv') {
      const query = `${details?.title || ''} ${selectedEpisode.name} S${currentSeason}E${selectedEpisode.episode_number}`;
      findAndPlayVideo(query);
    }
  }, [selectedEpisode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-purple/30 border-t-neon-purple" />
          <div className="absolute -inset-4 animate-pulse rounded-full border border-neon-purple/10" />
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep">
        <div className="text-center">
          <p className="text-lg text-white/50">Content not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-neon-purple hover:text-neon-blue"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep">
      <CinematicBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {details.backdrop && (
          <img src={details.backdrop} alt="" className="h-full w-full object-cover opacity-5 blur-xl" />
        )}
        <div className="absolute inset-0 bg-deep/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl lg:max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-20 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-neon-crimson/30 hover:bg-neon-crimson/10 hover:text-neon-crimson">
              <Heart size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-neon-blue/30 hover:bg-neon-blue/10 hover:text-neon-blue">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-6">
          {streamLoading ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-deep-alt flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader size={32} className="animate-spin text-neon-purple" />
                <p className="text-sm text-white/50">Searching for playable video...</p>
              </div>
            </div>
          ) : isPlaying && selectedVideo ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-cinematic">
              <iframe
                key={selectedVideo.id}
                src={selectedVideo.embedUrl}
                className="h-full w-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            /* Thumbnail with Play Button */
            <div
              className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-deep-alt"
              onClick={handlePlay}
            >
              {details.backdrop ? (
                <img
                  src={details.backdrop}
                  alt={details.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : details.image ? (
                <img
                  src={details.image}
                  alt={details.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-deep-alt">
                  <Film size={48} className="text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Play size={32} className="ml-1 fill-white text-white" />
                </div>
              </div>

              {selectedEpisode && mediaType === 'tv' && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass rounded-xl px-4 py-3">
                    <Typography size={14} weight="semibold">
                      S{currentSeason}E{selectedEpisode.episode_number} — {selectedEpisode.name}
                    </Typography>
                  </div>
                </div>
              )}

              <div
                className="absolute inset-0 rounded-2xl border-2 border-neon-purple/0 transition-all duration-500 group-hover:border-neon-purple/40"
                style={{ boxShadow: 'inset 0 0 30px rgba(168, 85, 247, 0.1)' }}
              />
            </div>
          )}
        </div>

        {/* Video Results Selection */}
        {isPlaying && youtubeResults.length > 1 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-white/60">More video results</h3>
            <div className="flex gap-3 overflow-x-auto scroll-cinematic pb-2">
              {youtubeResults.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                    selectedVideo?.id === video.id
                      ? 'border-neon-purple/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-20 w-36 object-cover"
                  />
                  <div className="px-2 py-1">
                    <p className="max-w-[140px] truncate text-[10px] text-white/60">{video.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              mediaType === 'movie' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-neon-purple/10 text-neon-purple'
            }`}>
              {mediaType === 'movie' ? <Film size={12} /> : <Tv size={12} />}
              {mediaType === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {details.status && (
              <span className="text-xs text-white/30">{details.status}</span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white">{details.title}</h1>

          {details.tagline && (
            <p className="mt-2 text-sm italic text-white/40">"{details.tagline}"</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4">
            {details.rating && (
              <span className="flex items-center gap-1.5 rounded-full bg-neon-gold/10 px-3 py-1 text-sm text-neon-gold">
                <Star size={12} className="fill-neon-gold" />
                {details.rating}
              </span>
            )}
            {details.releaseDate && (
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                <Calendar size={14} />
                {details.releaseDate}
              </span>
            )}
            {details.runtime && (
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                <Clock size={14} />
                {details.runtime} min
              </span>
            )}
            {mediaType === 'tv' && details.seasons && (
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                <Tv size={14} />
                {details.seasons} Season{details.seasons > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {details.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {details.genres.map((genre, i) => (
                <span
                  key={i}
                  className="rounded-full border border-neon-purple/20 bg-neon-purple/5 px-3 py-1 text-xs font-medium text-neon-purple/80"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-sm lg:text-base leading-relaxed text-white/60">
              {showDescription
                ? details.description?.slice(0, 350)
                : details.description}
            </p>
            {details.description?.length > 350 && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="mt-2 text-sm font-medium text-neon-purple transition-colors hover:text-neon-blue"
              >
                {showDescription ? 'Show More' : 'Show Less'}
              </button>
            )}
          </div>
        </div>

        {/* TV Shows: Season/Episode Selector */}
        {mediaType === 'tv' && details.seasons && details.seasons > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">Episodes</h2>

            {/* Season Selector */}
            <div className="mb-4 flex gap-2 overflow-x-auto scroll-cinematic pb-2">
              {Array.from({ length: details.seasons }, (_, i) => i + 1).map((season) => (
                <button
                  key={season}
                  onClick={() => setCurrentSeason(season)}
                  className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    currentSeason === season
                      ? 'border border-neon-purple/30 bg-neon-purple/10 text-neon-purple'
                      : 'border border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                  }`}
                >
                  Season {season}
                </button>
              ))}
            </div>

            {/* Episodes List */}
            {seasonLoading ? (
              <div className="flex justify-center py-10">
                <Loader size={24} className="animate-spin text-neon-purple" />
              </div>
            ) : (
              <div className="space-y-2">
                {episodes.map((episode, i) => {
                  const isActive = selectedEpisode?.id === episode.id;
                  return (
                    <button
                      key={episode.id}
                      onClick={() => handleEpisodeClick(episode)}
                      className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-all duration-300 ${
                        isActive
                          ? 'border border-neon-purple/30 bg-neon-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                          : 'border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-deep-alt">
                        {episode.still_path ? (
                          <img
                            src={episode.still_path}
                            alt={episode.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Play size={16} className="text-white/20" />
                          </div>
                        )}
                        {isActive && isPlaying ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-neon-purple/70 backdrop-blur-sm">
                            <Play size={16} className="fill-white text-white" />
                          </div>
                        ) : (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-1 text-center">
                            <span className="text-[10px] font-bold text-white">
                              E{episode.episode_number}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-neon-purple' : 'text-white/80'}`}>
                          {episode.name}
                        </p>
                        {episode.overview && (
                          <p className="mt-0.5 text-xs text-white/30 truncate">{episode.overview}</p>
                        )}
                        <div className="mt-1 flex items-center gap-3">
                          {episode.air_date && (
                            <span className="text-[10px] text-white/20">{episode.air_date}</span>
                          )}
                          {episode.runtime && (
                            <span className="text-[10px] text-white/20">{episode.runtime}min</span>
                          )}
                          {episode.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-neon-gold">
                              <Star size={8} className="fill-neon-gold" />
                              {episode.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-neon-purple' : 'text-white/20'}`}>
                        <Play size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Similar Content */}
        {details.similar && details.similar.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">More Like This</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
              {details.similar.slice(0, 14).map((item) => (
                <a
                  key={item.id}
                  href={`/watch/${item.mediaType}/${item.tmdbId}`}
                  className="group overflow-hidden rounded-xl border border-white/5 transition-all hover:border-neon-purple/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-deep-alt">
                        <Film size={24} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[11px] font-medium text-white line-clamp-2">{item.title}</p>
                      <p className="text-[10px] text-white/40">{item.releaseDate}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchPage;
