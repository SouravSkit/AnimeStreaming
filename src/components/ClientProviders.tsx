'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore, initUserStore } from '@/store/userStore';
import BottomNav from './BottomNav';
import { Toaster } from 'react-hot-toast';

function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { auth, skip } = useUserStore();

  useEffect(() => {
    initUserStore();
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  const showNav = auth || skip;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'toast-cinematic',
          duration: 3000,
          style: {
            background: 'rgba(15, 10, 35, 0.95)',
            color: '#e8e0f0',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.2)',
            borderRadius: '16px',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      />
      <div className={showNav ? 'pb-20' : ''}>{children}</div>
      {showNav && <BottomNav />}
    </>
  );
}

export default ClientProviders;
