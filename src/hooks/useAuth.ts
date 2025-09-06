import { useState, useEffect } from 'react';
import { onAuthStateChange, signOut } from '@/lib/supabase-service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

// Singleton state dla autoryzacji - jeden stan dla całej aplikacji
let globalUser: User | null = null;
let globalLoading = true;
let globalListeners: Array<() => void> = [];

const notifyListeners = () => {
  console.log('Notifying listeners, count:', globalListeners.length);
  globalListeners.forEach(listener => listener());
};

const setGlobalUser = (user: User | null) => {
  console.log('Setting global user:', user);
  globalUser = user;
  notifyListeners();
};

const setGlobalLoading = (loading: boolean) => {
  console.log('Setting global loading:', loading);
  globalLoading = loading;
  notifyListeners();
};

// Inicjalizacja stanu - wykonana tylko raz
let isInitialized = false;
const initializeGlobalAuth = async () => {
  if (isInitialized) return;
  isInitialized = true;
  console.log('Initializing global auth...');


  
  try {
    // Sprawdź czy localStorage jest dostępny
    if (typeof window !== 'undefined' && window.localStorage) {
      // Sprawdź czy użytkownik jest zalogowany przy ładowaniu
      const storedUser = localStorage.getItem('user');
      console.log('Stored user on init:', storedUser);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user on init:', parsedUser);
          setGlobalUser(parsedUser);
          // Ustaw loading na false po ustawieniu użytkownika z małym opóźnieniem
          setTimeout(() => {
            setGlobalLoading(false);
          }, 100);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('user');
          }
          // Ustaw loading na false nawet w przypadku błędu z małym opóźnieniem
          setTimeout(() => {
            setGlobalLoading(false);
          }, 100);
        }
      } else {
        // Brak użytkownika w localStorage - ustaw loading na false z małym opóźnieniem
        console.log('No stored user found on init');
        setTimeout(() => {
          setGlobalLoading(false);
        }, 100);
      }
    }
  } catch (error) {
    console.error('Error in initialization:', error);
    // Ustaw loading na false w przypadku błędu inicjalizacji z małym opóźnieniem
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
  }

  // Nasłuchuj zmian stanu autoryzacji Supabase (tylko dla Google OAuth)
  const { data: { subscription } } = onAuthStateChange((supabaseUser) => {
    console.log('Supabase auth state changed:', supabaseUser);
    
    if (supabaseUser) {
      // Użytkownik zalogowany przez Supabase - pobierz dane z naszej bazy
      console.log('Supabase user found, fetching user data...');
      fetchUserData(supabaseUser.email);
    } else {
      // Użytkownik wylogowany przez Supabase - ale sprawdź czy nie ma lokalnej sesji
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          // Tylko jeśli nie ma lokalnej sesji, resetuj użytkownika
          console.log('No stored user, setting user to null');
          setGlobalUser(null);
          setTimeout(() => {
            setGlobalLoading(false);
          }, 100);
        } else {
          // Jeśli jest użytkownik w localStorage, ustaw loading na false
          console.log('Stored user found, keeping user logged in');
          setTimeout(() => {
            setGlobalLoading(false);
          }, 100);
        }
      } else {
        // Jeśli localStorage nie jest dostępny, ustaw loading na false
        setTimeout(() => {
          setGlobalLoading(false);
        }, 100);
      }
    }
  });
};

const fetchUserData = async (email: string) => {
  try {
    console.log('Fetching user data for email:', email);
    const response = await fetch('/api/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('User data response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('User data received:', data);
      await login(data.user);
    } else if (response.status === 404) {
      // Użytkownik nie istnieje w bazie - to normalne dla nowych użytkowników Google
      // Nie robimy nic, callback page zajmie się utworzeniem użytkownika
      console.log('User not found in database, will be created by callback page');
      setTimeout(() => {
        setGlobalLoading(false);
      }, 100);
    } else {
      // Inny błąd - ustaw loading na false
      console.error('Error fetching user data:', response.status);
      setTimeout(() => {
        setGlobalLoading(false);
      }, 100);
    }
  } catch (error) {
    // Silent error handling
    console.error('Error in fetchUserData:', error);
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
  }
};

const login = async (userData: User) => {
  console.log('Logging in user:', userData);
  setGlobalUser(userData);
  
  // Sprawdź czy localStorage jest dostępny
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User saved to localStorage');
    // Dodaj małe opóźnienie żeby dać czas na zapisanie danych
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Sprawdź czy dane zostały zapisane
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // Jeśli dane nie zostały zapisane, spróbuj ponownie
      localStorage.setItem('user', JSON.stringify(userData));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Ustaw loading na false po zalogowaniu z małym opóźnieniem
  setTimeout(() => {
    setGlobalLoading(false);
  }, 100);
};

const logout = async () => {
  try {
    console.log('Logging out user...');
    await signOut();
    setGlobalUser(null);
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
      console.log('User removed from localStorage');
    }
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback - usuń dane lokalnie nawet jeśli błąd
    setGlobalUser(null);
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
      console.log('User removed from localStorage (fallback)');
    }
    window.location.href = '/login';
  }
};

export function useAuth() {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    console.log('useAuth useEffect triggered');
    // Inicjalizuj globalny stan jeśli nie został zainicjalizowany
    initializeGlobalAuth();
    
    // Dodaj listener do globalnych zmian
    const listener = () => {
      console.log('useAuth listener triggered');
      forceUpdate({});
    };
    globalListeners.push(listener);
    
    // Cleanup
    return () => {
      console.log('useAuth cleanup');
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  const isAuthenticated = !!globalUser;

  return {
    user: globalUser,
    loading: globalLoading,
    login,
    logout,
    isAuthenticated,
  };
}
