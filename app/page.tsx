"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlayerCard from "@/components/player-card"
import AdminPanel from "@/components/admin-panel"
import MatchSchedule from "@/components/match-schedule"
import TeamStandings from "@/components/team-standings"
import EnhancedStatsChat from "@/components/enhanced-stats-chat"
import UserSelector from "@/components/user-selector"
import type { Player, UserSession } from "@/lib/types"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { Settings, Crown, Star, BarChart3, Calendar, MessageCircle, Trophy } from "lucide-react"
import ChampagneStats from "@/components/champagne-stats"

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [mvpOfWeek, setMvpOfWeek] = useState<Player | null>(null)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [secretKey, setSecretKey] = useState("")
  const [showAdmin, setShowAdmin] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("players")

  const loadPlayers = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!hasValidCredentials) {
        const mockPlayers: Player[] = [
          {
            id: "1",
            name: "Lionel Messi",
            team: "Inter Miami",
            position: "delantero",
            goals: 15,
            assists: 12,
            saves: 0,
            partidos: 10,
            mvp_count: 8,
            rating: 5,
            card_style: "cosmic",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "2",
            name: "Cristiano Ronaldo",
            team: "Al Nassr",
            position: "delantero",
            goals: 18,
            assists: 6,
            saves: 0,
            partidos: 12,
            mvp_count: 7,
            rating: 5,
            card_style: "elite",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "3",
            name: "Kylian Mbappé",
            team: "PSG",
            position: "delantero",
            goals: 22,
            assists: 8,
            saves: 0,
            partidos: 14,
            mvp_count: 9,
            rating: 5,
            card_style: "fire",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "4",
            name: "Thibaut Courtois",
            team: "Real Madrid",
            position: "portero",
            goals: 0,
            assists: 0,
            saves: 85,
            partidos: 15,
            mvp_count: 4,
            rating: 4,
            card_style: "holographic",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "5",
            name: "Tacua",
            team: "Deportivo Saprissa",
            position: "delantero",
            goals: 3,
            assists: 2,
            saves: 0,
            partidos: 5,
            mvp_count: 0,
            rating: 4,
            card_style: "glass",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "6",
            name: "Erling Haaland",
            team: "Manchester City",
            position: "delantero",
            goals: 25,
            assists: 4,
            saves: 0,
            partidos: 16,
            mvp_count: 6,
            rating: 5,
            card_style: "diamond",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "7",
            name: "German Rauda",
            team: "Admin Team",
            position: "medio",
            goals: 0,
            assists: 0,
            saves: 0,
            partidos: 0,
            mvp_count: 0,
            rating: 5,
            card_style: "cosmic",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          },
        ]

        setPlayers(mockPlayers)
        setMvpOfWeek(mockPlayers[2])
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("players").select("*").order("mvp_count", { ascending: false })

      if (error) throw error

      setPlayers(data || [])

      if (data && data.length > 0) {
        setMvpOfWeek(data[0])
      }
    } catch (error) {
      console.error("Error loading players:", error)
    }
    setIsLoading(false)
  }, [])

  const checkUserVoteStatus = useCallback(async () => {
    if (!userSession?.name || !hasValidCredentials) return

    try {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("voter_name", userSession.name)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error
      setHasVoted((data || []).length > 0)
    } catch (error) {
      console.error("Error checking vote status:", error)
    }
  }, [userSession?.name])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  useEffect(() => {
    if (userSession?.name) {
      checkUserVoteStatus()
    }
  }, [userSession, checkUserVoteStatus])

  const handleVote = async (playerId: string) => {
    if (!userSession?.name || hasVoted) return

    if (!hasValidCredentials) {
      alert("Demo mode: Voting requires Supabase configuration")
      return
    }

    try {
      const { error: voteError } = await supabase.from("votes").insert({
        player_id: playerId,
        voter_name: userSession.name,
      })

      if (voteError) throw voteError

      const { error: updateError } = await supabase
        .from("players")
        .update({ mvp_count: players.find((p) => p.id === playerId)!.mvp_count + 1 })
        .eq("id", playerId)

      if (updateError) throw updateError

      setHasVoted(true)
      loadPlayers()
      alert("¡Voto registrado exitosamente!")
    } catch (error) {
      console.error("Error voting:", error)
      alert("Error al registrar el voto")
    }
  }

  const handleAdminAccess = () => {
    if (userSession?.name === "German Rauda" && secretKey === "admin123") {
      setShowAdmin(true)
    } else {
      alert("Credenciales inválidas")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mx-auto mb-4"></div>
          </div>
          <p className="text-amber-400 text-lg font-bold">Cargando...</p>
          <p className="text-gray-400 text-sm mt-2">Preparando estadísticas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo de la liga restaurado */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <img
                  src="/images/champagne-league-logo.png"
                  alt="Champagne League"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const sibling = e.currentTarget.nextElementSibling as HTMLElement
                    if (sibling) sibling.style.display = "flex"
                  }}
                />
                <div className="hidden w-8 h-8 items-center justify-center">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black text-amber-400">CHAMPAGNE</h1>
                <p className="text-xs text-gray-400 -mt-1">Stats League</p>
              </div>
            </div>

            {userSession?.name && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-amber-400">Admin Access</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Clave secreta"
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Button onClick={handleAdminAccess} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                      Acceder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Configuration Notice */}
        {!hasValidCredentials && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-sm font-medium">Demo Mode</p>
            </div>
            <p className="text-amber-300/80 text-xs mt-1">Configura Supabase para funcionalidad completa</p>
          </div>
        )}

        {/* User Selector */}
        <UserSelector onUserSelect={setUserSession} currentUser={userSession} />

        {/* Vote Status */}
        {userSession?.name && hasVoted && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Ya votaste esta semana
            </p>
          </div>
        )}

        {/* MVP of the Week - Mobile Optimized */}
        {mvpOfWeek && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-black text-amber-400">MVP DE LA SEMANA</h2>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto"></div>
            </div>
            <div className="flex justify-center">
              <PlayerCard player={mvpOfWeek} onVote={handleVote} canVote={false} />
            </div>
          </div>
        )}

        {/* Mobile Navigation Tabs - FIXED */}
        <Tabs defaultValue="players" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4 bg-gray-900 border border-gray-700 p-1 rounded-lg w-full h-auto">
            <TabsTrigger
              value="players"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 rounded text-xs min-h-[60px]"
            >
              <Star className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Cards</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 rounded text-xs min-h-[60px]"
            >
              <Calendar className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Fechas</span>
            </TabsTrigger>
            <TabsTrigger
              value="standings"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 rounded text-xs min-h-[60px]"
            >
              <BarChart3 className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Tabla</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 rounded text-xs min-h-[60px]"
            >
              <MessageCircle className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="champagne"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 rounded text-xs min-h-[60px]"
            >
              <Trophy className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-2">JUGADORES DESTACADOS</h2>
              <div className="w-12 h-0.5 bg-purple-400 mx-auto"></div>
            </div>

            {/* Mobile Grid - 1 column on small screens, 2 on larger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
              {players.filter(player => player).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onVote={handleVote}
                  canVote={!!userSession?.name && !hasVoted}
                />
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-700">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 text-lg font-medium">No hay jugadores</p>
                <p className="text-gray-500 text-sm">El admin puede subir datos</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <MatchSchedule />
          </TabsContent>

          <TabsContent value="standings">
            <TeamStandings />
          </TabsContent>

          <TabsContent value="chat">
            <EnhancedStatsChat userSession={userSession} />
          </TabsContent>

          <TabsContent value="champagne">
            <ChampagneStats />
          </TabsContent>
        </Tabs>

        {/* Admin Panel */}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </div>
    </div>
  )
}
