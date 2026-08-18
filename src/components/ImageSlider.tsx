'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Typography from './Typography';

type AnimeItem = {
  id: string;
  image: string;
  title: string;
  genres?: string[];
};

type Props = {
  data: AnimeItem[];
};

function ImageSlider({ data }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.length]);

  if (!data || data.length === 0) return null;

  const currentItem = data[currentIndex];

  return (
    <div className="relative h-[66vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: `url(${currentItem.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center px-8 pb-20">
        <Typography size={40} weight="bold" align="center">
          {currentItem.title}
        </Typography>

        {/* Genres */}
        {currentItem.genres && (
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {currentItem.genres.slice(0, 4).map((genre, i) => (
              <span key={i} className="text-sm font-poppins-light text-text">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Play Button */}
        <Link
          href={`/anime/${currentItem.id}`}
          className="mt-6 w-4/5 rounded-xl border border-white py-3 text-center font-poppins-semibold transition-colors hover:bg-white hover:text-black"
        >
          Play
        </Link>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {data.slice(0, Math.min(data.length, 10)).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;
