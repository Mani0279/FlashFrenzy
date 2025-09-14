// app/page.tsx - Updated with modern, attractive design
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Flashcard Frenzy
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto font-medium">
              Compete with friends in real-time flashcard battles! 
              <span className="block mt-2 text-lg text-gray-600">
                Test your knowledge, race against time, and climb the leaderboard
              </span>
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              {session ? (
                <Link
                  href="/lobby"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25"
                >
                  🎮 Enter Game Lobby
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white text-xl font-semibold rounded-2xl hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-green-500/25"
                >
                  🚀 Get Started Now
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How to Play Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            How to Play
          </h2>
          <p className="text-xl text-gray-600">
            Jump into the action in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              icon: "👤",
              title: "Sign In",
              description: "Create your account or sign in to join the battle",
              color: "from-blue-500 to-blue-600"
            },
            {
              step: "2", 
              icon: "🎯",
              title: "Choose Deck",
              description: "Pick a flashcard deck and create or join a match",
              color: "from-purple-500 to-purple-600"
            },
            {
              step: "3",
              icon: "⚡",
              title: "Race to Answer",
              description: "Be the first to answer correctly and earn points",
              color: "from-green-500 to-green-600"
            },
            {
              step: "4",
              icon: "🏆",
              title: "Win & Glory",
              description: "Watch live updates and compete for the top spot",
              color: "from-yellow-500 to-orange-500"
            }
          ].map((item, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2">
                {/* Step Number */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                
                {/* Icon */}
                <div className="text-4xl mb-4 text-center">
                  {item.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                  {item.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              {/* Connecting Line (hidden on mobile) */}
              {index < 3 && (
                <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Flashcard Frenzy?
            </h2>
            <p className="text-xl text-gray-300">
              Experience the most exciting way to learn and compete
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Real-Time Battles",
                description: "Instant updates and live competition with players worldwide"
              },
              {
                icon: "🎯",
                title: "Multiple Categories",
                description: "Math, Geography, Programming, and more topics to master"
              },
              {
                icon: "📊",
                title: "Track Progress",
                description: "Detailed match history and performance analytics"
              },
              {
                icon: "🏅",
                title: "Competitive Scoring",
                description: "First correct answer wins - speed and accuracy matter"
              },
              {
                icon: "🎮",
                title: "Easy to Play",
                description: "Jump in instantly - no downloads or complex setup required"
              },
              {
                icon: "👥",
                title: "Play with Friends",
                description: "Create private matches or join public games"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Test Your Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of players in the ultimate flashcard challenge
          </p>
          
          {session ? (
            <Link
              href="/lobby"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-xl font-semibold rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              🎮 Start Playing Now
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-xl font-semibold rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              🚀 Join the Battle
            </Link>
          )}
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}