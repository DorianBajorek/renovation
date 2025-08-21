"use client"
import { useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative w-full flex justify-between items-center p-6 border-b border-gray-200 bg-white shadow-sm">
      {/* Logo jako link do strony głównej */}
      <Link href="/" className="text-2xl font-bold text-black flex items-center gap-2">
        🏡 Remonto
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
        <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Funkcje</a>
        <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Cennik</a>
        <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg">Kontakt</a>
        <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Zaloguj się</a>
      </nav>

      {/* Mobile Menu Button */}
      <button 
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-200 z-10`}>
        <nav className="flex flex-col p-4 gap-2">
          <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Funkcje</a>
          <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Cennik</a>
          <a href="#" className="py-3 px-4 hover:bg-blue-50 rounded-lg text-gray-800 hover:text-blue-600 transition-colors">Kontakt</a>
          <a href="#" className="py-3 px-4 mt-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors">Zaloguj się</a>
        </nav>
      </div>
    </header>
  );
}
