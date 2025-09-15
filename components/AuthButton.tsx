'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignIn = () => {
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
  };

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-xl"></div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {session.user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700 font-medium">
            Hello, {session.user?.name?.split(' ')[0]}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
    >
      Sign In
    </button>
  );
}