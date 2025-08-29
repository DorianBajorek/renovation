"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Błąd podczas autoryzacji');
          return;
        }

        console.log('Session data:', data);
        console.log('User from session:', data.session?.user);

        if (data.session?.user) {
          const user = data.session.user;
          
          // Sprawdź czy użytkownik jest już zalogowany w localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.email === user.email) {
                console.log('User already logged in, redirecting...');
                router.push('/');
                return;
              }
            } catch (error) {
              console.log('Error parsing stored user, continuing...');
            }
          }
          
          // Zawsze używaj RPC do obsługi użytkownika (sprawdzenie + utworzenie jeśli potrzeba)
          console.log('Handling user with RPC:', user.email);
          console.log('User metadata:', user.user_metadata);
          
          // Lepiej obsłuż dane z Google OAuth
          const firstName = user.user_metadata?.first_name || 
                          user.user_metadata?.full_name?.split(' ')[0] || 
                          user.user_metadata?.name?.split(' ')[0] || 
                          'Użytkownik';
          
          const lastName = user.user_metadata?.last_name || 
                         user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                         user.user_metadata?.name?.split(' ').slice(1).join(' ') || 
                         'Google';
          
          // Użyj RPC (Remote Procedure Call) do sprawdzenia i utworzenia użytkownika
          // To pozwoli ominąć polityki RLS dla operacji INSERT
          const { data: userData, error: createError } = await supabase.rpc('handle_new_user', {
            user_email: user.email,
            user_first_name: firstName,
            user_last_name: lastName
          });

          if (createError) {
            console.error('Create user error:', createError);
            setError('Błąd podczas tworzenia konta');
            return;
          }

          console.log('Successfully created/retrieved user:', userData);

          // Zaloguj użytkownika
          await login({
            id: userData[0].id,
            email: userData[0].email,
            firstName: userData[0].first_name,
            lastName: userData[0].last_name,
            createdAt: userData[0].created_at,
          });

          // Przekieruj do strony głównej
          router.push('/');
        } else {
          setError('Nie udało się pobrać danych użytkownika');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Wystąpił nieoczekiwany błąd');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, login]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Logowanie przez Google...
          </h2>
          <p className="text-slate-600">
            Proszę czekać, kończymy proces autoryzacji
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Błąd logowania
          </h2>
          <p className="text-slate-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Wróć do logowania
          </button>
        </div>
      </div>
    );
  }

  return null;
}
