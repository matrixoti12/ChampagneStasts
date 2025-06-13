"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
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

  useEffect(() => {
    loadPlayers()
  }, [])

  useEffect(() => {
    if (userSession?.name) {
      checkUserVoteStatus()
    }
  }, [userSession])

  const loadPlayers = async () => {
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
  }

  const checkUserVoteStatus = async () => {
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
  }

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
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img src="/images/champagne-league-logo.png" alt="Champagne Stats League" className="h-24 md:h-32" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mb-4">
            CHAMPAGNE STATS LEAGUE
          </h1>
          <p className="text-xl text-amber-200/80 font-light">Estadísticas premium de los mejores jugadores</p>
        </div>

        {/* Configuration Notice */}
        {!hasValidCredentials && (
          <Card className="mb-8 bg-amber-500/10 backdrop-blur-xl border border-amber-500/20">
            <CardContent className="text-center py-6">
              <p className="text-amber-300 text-lg font-semibold mb-2">
                🚀 Demo Mode - Configure Supabase for full functionality
              </p>
              <p className="text-amber-200 text-sm">
                Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables to enable
                voting and admin features.
              </p>
            </CardContent>
          </Card>
        )}

        {/* User Selector */}
        <UserSelector onUserSelect={setUserSession} currentUser={userSession} />

        {/* Admin Access */}
        {userSession?.name && (
          <div className="mb-8 flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900/95 backdrop-blur-md border border-amber-500/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-400">Acceso Administrativo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Clave secreta"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button
                    onClick={handleAdminAccess}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-none"
                  >
                    Acceder al Panel Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Vote Status */}
        {userSession?.name && hasVoted && (
          <Card className="mb-8 bg-green-500/10 backdrop-blur-xl border border-green-500/20">
            <CardContent className="text-center py-4">
              <p className="text-green-400 text-sm flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                Ya has votado esta semana
              </p>
            </CardContent>
          </Card>
        )}

        {/* MVP of the Week */}
        {mvpOfWeek && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-white text-center flex items-center justify-center space-x-4">
              <Crown className="w-8 h-8 text-amber-400" />
              <span>MVP DE LA SEMANA</span>
              <Crown className="w-8 h-8 text-amber-400" />
            </h2>
            <div className="flex justify-center">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <PlayerCard player={mvpOfWeek} onVote={handleVote} canVote={false} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="players" value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid grid-cols-5 mb-8 bg-white/5 border border-white/10">
            <TabsTrigger
              value="players"
              className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Star className="w-4 h-4" />
              <span>Jugadores</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Calendar className="w-4 h-4" />
              <span>Partidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="standings"
              className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Posiciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="champagne"
              className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Trophy className="w-4 h-4" />
              <span>Champagne</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">JUGADORES DESTACADOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onVote={handleVote}
                  canVote={!!userSession?.name && !hasVoted}
                />
              ))}
            </div>

            {players.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardContent className="text-center py-12">
                  <p className="text-white text-xl">
                    No hay jugadores disponibles. El administrador puede subir datos de jugadores.
                  </p>
                </CardContent>
              </Card>
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
