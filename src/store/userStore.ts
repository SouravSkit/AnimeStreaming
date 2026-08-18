'use client';

import { create } from 'zustand';

interface UserData {
  auth: boolean;
  email: string;
  id: string | null;
  name: string;
  image: string;
  skip: boolean;
}

interface UserStore extends UserData {
  setUser: (data: Partial<UserData>) => void;
  logout: () => void;
  skipAuth: () => void;
}

const defaultUser: UserData = {
  auth: false,
  email: '',
  id: null,
  name: '',
  image: '',
  skip: false,
};

export const useUserStore = create<UserStore>((set) => ({
  ...defaultUser,

  setUser: (data) =>
    set((state) => {
      const newState = { ...state, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newState));
      }
      return newState;
    }),

  logout: () => {
    set(defaultUser);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  skipAuth: () => {
    const newState = { ...defaultUser, skip: true };
    set(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(newState));
    }
  },
}));

// Initialize from localStorage on client side
export function initUserStore() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        useUserStore.setState(parsed);
      } catch {
        // ignore
      }
    }
  }
}
