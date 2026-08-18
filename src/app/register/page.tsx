'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useUserStore } from '@/store/userStore';
import Input from '@/components/Input';
import EnergyParticles from '@/components/EnergyParticles';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = yup.object().shape({
  name: yup.string().required('Username is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'At least 8 characters'),
});

function RegisterPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        setUser({
          auth: true,
          email: values.email,
          id: 'user-' + Date.now(),
          name: values.name,
          image: '',
          skip: false,
        });
        toast.success('Account created!');
        router.push('/');
      } catch (error: any) {
        toast.error(error.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-deep via-[#0a0520] to-deep" />
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] bg-gradient-radial from-neon-cyan/5 to-transparent" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-gradient-radial from-energy-purple/8 to-transparent" />
        <EnergyParticles count={20} color="#00d4ff" speed="slow" className="opacity-20" />
      </div>

      {/* Back Button */}
      <div className="absolute left-6 top-6 z-20 sm:left-10 sm:top-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md px-6 animate-scale-in">
        <div className="glass-strong rounded-3xl p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/20 to-energy-purple/10 border border-neon-cyan/20">
              <Shield size={24} className="text-neon-cyan" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="mt-1 text-sm text-white/40">Join the anime universe</p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <Input
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Username"
              error={formik.errors.name}
              touched={formik.touched.name}
            />
            <Input
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Email"
              type="email"
              error={formik.errors.email}
              touched={formik.touched.email}
            />
            <Input
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Password"
              type="password"
              error={formik.errors.password}
              touched={formik.touched.password}
            />

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-cinematic w-full rounded-2xl py-3.5 font-poppins font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or continue with</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          {/* Google */}
          <button
            onClick={() => toast.error('Google sign-in coming soon')}
            className="btn-outline-cinematic flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 font-medium text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Login link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-white/40">Already have an account? </span>
            <Link href="/login" className="text-sm font-medium text-neon-purple transition-colors hover:text-neon-blue">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
