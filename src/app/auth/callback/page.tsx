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
          
          // Sprawdź czy użytkownik istnieje w naszej bazie danych
          console.log('Checking if user exists in database:', user.email);
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, created_at')
            .eq('email', user.email)
            .single();

          console.log('Database query result:', { dbUser, dbError });

          if (dbError && dbError.code !== 'PGRST116') {
            // PGRST116 to "not found" error
            console.error('Database error:', dbError);
            setError('Błąd podczas pobierania danych użytkownika');
            return;
          }

          if (!dbUser) {
            // Użytkownik nie istnieje w naszej bazie - utwórz go
            console.log('Creating new user for Google OAuth:', user.email);
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
            
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                email: user.email,
                first_name: firstName,
                last_name: lastName,
                password_hash: 'google_oauth_user', // Specjalny marker dla użytkowników Google
              })
              .select('id, email, first_name, last_name, created_at')
              .single();

            if (createError) {
              console.error('Create user error:', createError);
              setError('Błąd podczas tworzenia konta');
              return;
            }

            console.log('Successfully created user:', newUser);

            // Zaloguj nowego użytkownika
            await login({
              id: newUser.id,
              email: newUser.email,
              firstName: newUser.first_name,
              lastName: newUser.last_name,
              createdAt: newUser.created_at,
            });
          } else {
            // Użytkownik istnieje - zaloguj go
            await login({
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.first_name,
              lastName: dbUser.last_name,
              createdAt: dbUser.created_at,
            });
          }

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
