'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAnimeInfo } from '@/lib/anime';
import Typography from '@/components/Typography';
import CinematicBurst from '@/components/CinematicBurst';
import EnergyParticles from '@/components/EnergyParticles';
import { ArrowLeft, Play, Star, Calendar, Clock, Share2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

type Episode = {
  id: string;
  number: number;
  title?: string;
};

type AnimeDetails = {
  id: string;
  title: string;
  image: string;
  description: string;
  releaseDate?: string;
  totalEpisodes: number;
  episodes: Episode[];
  genres?: string[];
  rating?: string;
  type?: string;
  status?: string;
};

function AnimeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [details, setDetails] = useState<AnimeDetails | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);
  const [loading, setLoading] = useState(true);
  const [burstActive, setBurstActive] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getAnimeInfo(id);
        setDetails(data);
        if (data?.episodes?.length > 0) {
          setSelectedEpisode(data.episodes[0].id);
        }
      } catch (error) {
        toast.error('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handlePlay = () => {
    setBurstActive(true);
  };

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

  return (
    <div className="min-h-screen bg-deep">
      <CinematicBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {details?.image && (
          <img
            src={details.image}
            alt=""
            className="h-full w-full object-cover opacity-5 blur-xl"
          />
        )}
        <div className="absolute inset-0 bg-deep/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-32">
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

        {/* Hero / Thumbnail */}
        <div className="mb-6">
          <div
            className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-deep-alt"
            onClick={handlePlay}
          >
            {details?.image && (
              <img
                src={details.image}
                alt={details.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play button overlay */}
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

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass rounded-xl px-4 py-3">
                <Typography size={14} weight="semibold">
                  {details?.status || 'Anime Details'}
                </Typography>
              </div>
            </div>

            {/* Neon border on hover */}
            <div className="absolute inset-0 rounded-2xl border-2 border-neon-purple/0 transition-all duration-500 group-hover:border-neon-purple/40" style={{ boxShadow: 'inset 0 0 30px rgba(168, 85, 247, 0.1)' }} />
          </div>
        </div>

        {/* Description */}
        {details && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {details.title}
            </h1>

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
              {details.totalEpisodes > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-white/50">
                  <Clock size={14} />
                  {details.totalEpisodes} Episodes
                </span>
              )}
              {details.type && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50">
                  {details.type}
                </span>
              )}
            </div>

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
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

            {/* Description */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-sm leading-relaxed text-white/60">
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
        )}

        {/* Episodes */}
        {details?.episodes && details.episodes.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Episodes</h2>
            <div className="space-y-2">
              {details.episodes.map((episode, i) => {
                const isActive = selectedEpisode === episode.id;
                return (
                  <button
                    key={episode.id}
                    onClick={() => setSelectedEpisode(episode.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-all duration-300 ${
                      isActive
                        ? 'border border-neon-purple/30 bg-neon-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                        : 'border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                    style={{ animation: `slide-up 0.4s ease-out ${Math.min(i * 0.03, 0.5)}s both` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                      {details.image && (
                        <img
                          src={details.image}
                          alt={`Ep ${episode.number}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-1 text-center">
                        <span className="text-[10px] font-bold text-white">EP.{episode.number}</span>
                      </div>
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-neon-purple' : 'text-white/80'}`}>
                        Episode {episode.number}
                      </p>
                      {episode.title && (
                        <p className="mt-0.5 text-xs text-white/30 truncate">{episode.title}</p>
                      )}
                    </div>

                    {/* Play icon */}
                    <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-neon-purple' : 'text-white/20'}`}>
                      <Play size={18} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No episodes fallback */}
        {details?.episodes && details.episodes.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-white/40">
              Episode data is not available for this anime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeDetailPage;
