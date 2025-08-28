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
  globalListeners.forEach(listener => listener());
};

const setGlobalUser = (user: User | null) => {
  globalUser = user;
  notifyListeners();
};

const setGlobalLoading = (loading: boolean) => {
  globalLoading = loading;
  notifyListeners();
};

// Inicjalizacja stanu - wykonana tylko raz
let isInitialized = false;
const initializeGlobalAuth = async () => {
  if (isInitialized) return;
  isInitialized = true;


  
  try {
    // Sprawdź czy localStorage jest dostępny
    if (typeof window !== 'undefined' && window.localStorage) {
      // Sprawdź czy użytkownik jest zalogowany przy ładowaniu
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
                           try {
            const parsedUser = JSON.parse(storedUser);
           setGlobalUser(parsedUser);
           // Ustaw loading na false po ustawieniu użytkownika z małym opóźnieniem
           setTimeout(() => {
             setGlobalLoading(false);
           }, 100);
                   } catch (error) {
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
           setTimeout(() => {
             setGlobalLoading(false);
           }, 100);
         }
     }
          } catch (error) {
     // Ustaw loading na false w przypadku błędu inicjalizacji z małym opóźnieniem
     setTimeout(() => {
       setGlobalLoading(false);
     }, 100);
   }

  // Nasłuchuj zmian stanu autoryzacji Supabase (tylko dla Google OAuth)
  const { data: { subscription } } = onAuthStateChange((supabaseUser) => {
    if (supabaseUser) {
      // Użytkownik zalogowany przez Supabase - pobierz dane z naszej bazy
      fetchUserData(supabaseUser.email);
    } else {
      // Użytkownik wylogowany przez Supabase - ale sprawdź czy nie ma lokalnej sesji
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          // Tylko jeśli nie ma lokalnej sesji, resetuj użytkownika
          setGlobalUser(null);
          setTimeout(() => {
            setGlobalLoading(false);
          }, 100);
        } else {
          // Jeśli jest użytkownik w localStorage, ustaw loading na false
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
    const response = await fetch('/api/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      await login(data.user);
    } else {
      // Jeśli nie udało się pobrać danych użytkownika, ustaw loading na false
      setTimeout(() => {
        setGlobalLoading(false);
      }, 100);
    }
  } catch (error) {
    // Silent error handling
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
  }
};

const login = async (userData: User) => {
  setGlobalUser(userData);
  
  // Sprawdź czy localStorage jest dostępny
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('user', JSON.stringify(userData));
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
    await signOut();
    setGlobalUser(null);
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
    }
    window.location.href = '/login';
  } catch (error) {
    // Fallback - usuń dane lokalnie nawet jeśli błąd
    setGlobalUser(null);
    setTimeout(() => {
      setGlobalLoading(false);
    }, 100);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
    }
    window.location.href = '/login';
  }
};

export function useAuth() {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    // Inicjalizuj globalny stan jeśli nie został zainicjalizowany
    initializeGlobalAuth();
    
    // Dodaj listener do globalnych zmian
    const listener = () => forceUpdate({});
    globalListeners.push(listener);
    
    // Cleanup
    return () => {
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
