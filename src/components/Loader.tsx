'use client';

import React from 'react';

type Props = {
  visible: boolean;
};

function Loader({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}

export default Loader;
