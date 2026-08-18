'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore, initUserStore } from '@/store/userStore';
import LandingPage from './landing';
import HomePageContent from './home-content';

function RootPage() {
  const [mounted, setMounted] = useState(false);
  const { auth, skip } = useUserStore();

  useEffect(() => {
    initUserStore();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!auth && !skip) {
    return <LandingPage />;
  }

  return <HomePageContent />;
}

export default RootPage;
