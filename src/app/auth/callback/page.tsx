"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_callback_failed');
        return;
      }

      if (data.session) {
        // Successful authentication
        router.push('/');
      } else {
        // No session found
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/60 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <span className="text-3xl">🏡</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Logowanie...
        </h1>
        <p className="text-slate-600 mb-6">
          Trwa przetwarzanie logowania
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
