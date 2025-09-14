'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl">⚡</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
              Flashcard Frenzy
            </span>
          </Link>
          
          {/* Navigation Links */}
          {session && (
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                href="/lobby" 
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isActive('/lobby')
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                🎮 Lobby
              </Link>
              <Link 
                href="/history" 
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isActive('/history')
                    ? 'bg-purple-100 text-purple-700 shadow-md'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                📊 History
              </Link>
            </div>
          )}
          
          {/* Auth Button */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}