'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore, initUserStore } from '@/store/userStore';
import BottomNav from './BottomNav';
import DesktopHeader from './DesktopHeader';
import { Toaster } from 'react-hot-toast';
import AdGuard from './AdGuard';
import AdTrigger from './AdTrigger';

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
      <AdGuard />
      <AdTrigger />
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
      {showNav && <DesktopHeader />}
      <div className={showNav ? 'pb-20 lg:pb-16' : ''}>{children}</div>
      {showNav && <div className="lg:hidden"><BottomNav /></div>}
    </>
  );
}

export default ClientProviders;
