// app/page.tsx - Hydration-safe version without problematic animations
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Zap, 
  Users, 
  Target, 
  Play, 
  Crown, 
  Timer, 
  Medal,
  ArrowRight,
  Gamepad2,
  Brain,
  BarChart3,
  Star,
  ChevronRight
} from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Static background - no animations */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>
      
      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-20">
          {/* Status Bar */}
          <div className="flex justify-center mb-8">
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-medium">🔴 LIVE</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4" />
                  <span className="font-mono">1,247 players online</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-white">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-mono">32 active matches</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Title with Game UI Style */}
          <div className="text-center mb-16">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6 tracking-tight">
                FLASHCARD
                <span className="block text-6xl md:text-7xl text-yellow-400 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  FRENZY
                </span>
              </h1>
              
              {/* Game-style decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-cyan-400"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-pink-400"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-4 border-b-4 border-purple-400"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-yellow-400"></div>
            </div>
            
            <Badge variant="outline" className="text-lg px-4 py-2 mb-8 border-yellow-500/50 text-yellow-400">
              <Crown className="w-5 h-5 mr-2" />
              BATTLE ROYALE KNOWLEDGE
            </Badge>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              Enter the arena of minds! Compete in <span className="text-cyan-400 font-bold">real-time flashcard battles</span>,
              climb the global leaderboard, and prove your intellectual dominance.
            </p>
            
            <div className="flex justify-center gap-4 mb-12">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">⚡ Instant Matchmaking</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">🌍 Global Competition</Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">🏆 Ranked Matches</Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Link href="/lobby">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-8 py-6 rounded-xl shadow-2xl transition-all duration-300 group">
                    <Play className="mr-3 w-6 h-6" />
                    ENTER BATTLE ARENA
                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl px-8 py-6 rounded-xl shadow-2xl transition-all duration-300 group">
                    <Zap className="mr-3 w-6 h-6" />
                    JOIN THE FRENZY
                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Gamepad2 className="w-12 h-12 text-purple-400" />
              GAME MODES
            </h2>
            <p className="text-xl text-slate-300">Choose your battlefield</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                mode: "QUICK MATCH",
                icon: <Zap className="w-8 h-8" />,
                description: "Jump into instant 1v1 battles",
                players: "1v1",
                time: "2-5 min",
                difficulty: "All Levels",
                color: "from-green-500 to-emerald-600",
                glowColor: "hover:shadow-green-500/20"
              },
              {
                mode: "TOURNAMENT",
                icon: <Trophy className="w-8 h-8" />,
                description: "Compete in elimination brackets",
                players: "8-32",
                time: "15-30 min", 
                difficulty: "Competitive",
                color: "from-yellow-500 to-orange-500",
                glowColor: "hover:shadow-yellow-500/20"
              },
              {
                mode: "TEAM BATTLE",
                icon: <Users className="w-8 h-8" />,
                description: "Squad up with friends",
                players: "3v3",
                time: "10-15 min",
                difficulty: "Casual",
                color: "from-blue-500 to-cyan-500",
                glowColor: "hover:shadow-blue-500/20"
              },
              {
                mode: "RANKED",
                icon: <Crown className="w-8 h-8" />,
                description: "Climb the global ladder",
                players: "1v1",
                time: "5-10 min",
                difficulty: "Expert",
                color: "from-purple-500 to-pink-500",
                glowColor: "hover:shadow-purple-500/20"
              }
            ].map((mode, index) => (
              <Card key={index} className={`bg-slate-800/50 border-slate-600/50 hover:border-slate-500 transition-all duration-300 hover:scale-105 ${mode.glowColor} hover:shadow-2xl group cursor-pointer`}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110`}>
                    <div className="text-white">{mode.icon}</div>
                  </div>
                  <CardTitle className="text-xl text-white font-bold">{mode.mode}</CardTitle>
                  <CardDescription className="text-slate-300">{mode.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Players:</span>
                    <span className="text-white font-mono">{mode.players}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white font-mono">{mode.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Level:</span>
                    <Badge variant="secondary" className="text-xs">{mode.difficulty}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How to Play - Game Tutorial Style */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Brain className="w-12 h-12 text-cyan-400" />
              BATTLE TUTORIAL
            </h2>
            <p className="text-xl text-slate-300">Master the arena in 4 steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: "👤",
                title: "CREATE WARRIOR",
                description: "Sign up and customize your battle profile",
                progress: 25,
                color: "text-blue-400"
              },
              {
                step: 2,
                icon: "🎯", 
                title: "CHOOSE DOMAIN",
                description: "Select your knowledge battlefield",
                progress: 50,
                color: "text-purple-400"
              },
              {
                step: 3,
                icon: "⚔️",
                title: "ENGAGE COMBAT",
                description: "Race to answer and dominate opponents",
                progress: 75,
                color: "text-green-400"
              },
              {
                step: 4,
                icon: "🏆",
                title: "CLAIM VICTORY",
                description: "Earn XP, climb ranks, achieve glory",
                progress: 100,
                color: "text-yellow-400"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-slate-800/30 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group">
                  <CardHeader className="text-center relative">
                    {/* Step indicator */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-600">
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="text-6xl mb-4">{item.icon}</div>
                    
                    {/* Title */}
                    <CardTitle className={`text-xl font-bold ${item.color} font-mono tracking-wider`}>
                      {item.title}
                    </CardTitle>
                    
                    {/* Progress bar */}
                    <div className="w-full mt-4">
                      <Progress value={item.progress} className="h-2" />
                      <span className="text-xs text-slate-400 mt-1 block">{item.progress}% Complete</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-slate-300 text-center leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Connection arrow */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                    <ArrowRight className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats Dashboard */}
      <div className="relative z-10 py-20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <BarChart3 className="w-12 h-12 text-green-400" />
              LIVE BATTLE STATS
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Active Warriors", value: "1,247", icon: Users, color: "text-blue-400" },
              { label: "Battles Won Today", value: "15,892", icon: Trophy, color: "text-yellow-400" },
              { label: "Questions Answered", value: "284K", icon: Brain, color: "text-purple-400" },
              { label: "Average Response", value: "2.3s", icon: Timer, color: "text-green-400" }
            ].map((stat, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-600/50 text-center">
                <CardContent className="p-6">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Players Leaderboard Preview */}
          <Card className="bg-slate-800/50 border-slate-600/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white flex items-center justify-center gap-2">
                <Medal className="w-6 h-6 text-yellow-400" />
                TOP WARRIORS THIS WEEK
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: "FlashMaster", score: "2,847", wins: "47", icon: "👑" },
                  { rank: 2, name: "QuizNinja", score: "2,736", wins: "43", icon: "🥈" },
                  { rank: 3, name: "BrainStorm", score: "2,621", wins: "41", icon: "🥉" }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.icon}</span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-slate-400 text-sm">{player.wins} wins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{player.score}</p>
                      <p className="text-slate-400 text-sm">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 py-20 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-6xl font-bold text-white mb-6">
            READY FOR BATTLE?
          </h2>
          <p className="text-2xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Join the ultimate test of knowledge and reflexes. Your rank awaits!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/lobby">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-2xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-green-500/30 transition-all duration-300">
                  <Play className="mr-4 w-8 h-8" />
                  ENTER ARENA NOW
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-2xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
                  <Star className="mr-4 w-8 h-8" />
                  BEGIN YOUR JOURNEY
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}