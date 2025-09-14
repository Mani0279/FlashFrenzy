// app/layout.tsx - Updated layout structure
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Flashcard Frenzy - Multiplayer Quiz Game',
  description: 'Real-time multiplayer flashcard battles. Compete with friends in exciting quiz matches!',
  keywords: 'flashcards, quiz, multiplayer, real-time, game, education, learning',
  authors: [{ name: 'Flashcard Frenzy Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-2xl">⚡</span>
                    <span className="text-xl font-bold">Flashcard Frenzy</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    © 2024 Flashcard Frenzy. Challenge your mind, compete with friends.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}