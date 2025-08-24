"use client"
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Nav() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when selecting an option
  const handleMenuOptionClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="relative w-full flex justify-between items-center p-6 border-b border-gray-200 bg-white shadow-sm">
      {/* Logo jako link do strony głównej */}
      <Link href="/" className="text-2xl font-bold text-black flex items-center gap-2">
        🏡 Remonto
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
        {isAuthenticated ? (
          <>
            <Link href="/projekty" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Projekty</Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">Witaj, {user?.firstName}!</span>
              <button 
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Wyloguj się
              </button>
            </div>
          </>
        ) : (
          <>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Funkcje</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Cennik</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Kontakt</a>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors px-3 py-2 rounded-lg">Zaloguj się</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Zarejestruj się</Link>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        ref={buttonRef}
        className="md:hidden p-2 rounded-md text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Otwórz menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Navigation */}
      <div 
        ref={menuRef}
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-200 z-10`}
      >
        <nav className="flex flex-col p-4 gap-2">
          {isAuthenticated ? (
            <>
              <Link 
                href="/projekty" 
                className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors"
                onClick={handleMenuOptionClick}
              >
                Projekty
              </Link>
              <div className="py-3 px-4 text-gray-600 text-sm">Witaj, {user?.firstName}!</div>
              <button 
                onClick={() => {
                  logout();
                  handleMenuOptionClick();
                }}
                className="py-3 px-4 mt-2 bg-red-600 text-white rounded-lg text-center hover:bg-red-700 transition-colors"
              >
                Wyloguj się
              </button>
            </>
          ) : (
            <>
              <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Funkcje</a>
              <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Cennik</a>
              <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Kontakt</a>
              <div className="flex flex-col gap-2 mt-2">
                <Link 
                  href="/login" 
                  className="py-3 px-4 text-blue-600 hover:bg-blue-50 rounded-lg text-center hover:text-blue-700 transition-colors"
                  onClick={handleMenuOptionClick}
                >
                  Zaloguj się
                </Link>
                <Link 
                  href="/register" 
                  className="py-3 px-4 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors"
                  onClick={handleMenuOptionClick}
                >
                  Zarejestruj się
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
