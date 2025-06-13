"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import type { Player, UserSession } from "@/lib/types"
import { User, Target, Users, Shield, TrendingUp, RefreshCw } from "lucide-react"

interface PlayerStatsDisplayProps {
  userSession: UserSession | null
}

export default function PlayerStatsDisplay({ userSession }: PlayerStatsDisplayProps) {
  const [playerStats, setPlayerStats] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (userSession?.type === "player" && userSession.player_id) {
      loadPlayerStats()
    }
  }, [userSession])

  const loadPlayerStats = async () => {
    if (!userSession?.player_id) return

    setIsLoading(true)
    setImageError(false)
    try {
      if (!hasValidCredentials) {
        // Mock data for demo
        const mockStats: Player = {
          id: userSession.player_id,
          name: userSession.name,
          team: "Demo Team",
          position: "delantero",
          goals: 5,
          assists: 3,
          saves: 0,
          partidos: 8,
          mvp_count: 2,
          rating: 4,
          card_style: "glass",
          photo: "/placeholder.svg?height=144&width=144",
          league_logo_url: "/images/champagne-league-logo.png",
          team_logo_url: "/placeholder.svg?height=48&width=48",
        }
        setPlayerStats(mockStats)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("players").select("*").eq("id", userSession.player_id).single()

      if (error) throw error
      setPlayerStats(data)
    } catch (error) {
      console.error("Error loading player stats:", error)
    }
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (!userSession || userSession.type !== "player" || !userSession.can_update_stats) {
    return null
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
        </CardContent>
      </Card>
    )
  }

  if (!playerStats) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">No se pudieron cargar tus estadísticas</p>
          <Button onClick={loadPlayerStats} size="sm" className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getPositionIcon = () => {
    switch (playerStats.position) {
      case "delantero":
        return Target
      case "medio":
        return Users
      case "defensa":
        return Shield
      case "portero":
        return Shield
      case "polivalente":
        return TrendingUp
      default:
        return User
    }
  }

  const getPositionLabel = () => {
    switch (playerStats.position) {
      case "delantero":
        return "DELANTERO"
      case "medio":
        return "MEDIOCAMPO"
      case "defensa":
        return "DEFENSA"
      case "portero":
        return "PORTERO"
      case "polivalente":
        return "POLIVALENTE"
      default:
        return "JUGADOR"
    }
  }

  const PositionIcon = getPositionIcon()

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-green-400" />
            <span>Tus Estadísticas</span>
          </div>
          <Button onClick={loadPlayerStats} size="sm" variant="outline" className="bg-gray-800 border-gray-600">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información del jugador con foto real */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {/* Foto real del jugador */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                {!imageError && playerStats.photo && playerStats.photo !== "/placeholder.svg" ? (
                  <img
                    src={playerStats.photo}
                    alt={playerStats.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <PositionIcon className="w-8 h-8 text-white" />
                )}
                {/* Indicador de card style */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-black">
                  {playerStats.card_style === "cosmic" && "✨"}
                  {playerStats.card_style === "elite" && "👑"}
                  {playerStats.card_style === "fire" && "🔥"}
                  {playerStats.card_style === "holographic" && "🌈"}
                  {playerStats.card_style === "diamond" && "💎"}
                  {playerStats.card_style === "glass" && "🔮"}
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{playerStats.name}</h3>
                <p className="text-green-400 font-medium text-sm">{playerStats.team}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {getPositionLabel()}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs capitalize">
                    {playerStats.card_style}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-green-400 font-bold mb-2 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Rendimiento
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-400">{playerStats.mvp_count}</div>
                  <div className="text-xs text-gray-400">MVP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{playerStats.rating || 3}</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{playerStats.partidos || 0}</div>
                  <div className="text-xs text-gray-400">Partidos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas específicas */}
          <div className="space-y-3">
            <h4 className="text-white font-bold flex items-center text-sm">
              <Target className="w-4 h-4 mr-1 text-amber-400" />
              Estadísticas
            </h4>

            {playerStats.position === "portero" ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
                  <div className="text-2xl font-bold text-blue-400">{playerStats.saves || 0}</div>
                  <div className="text-xs text-blue-300">Atajadas Totales</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                    <div className="text-lg font-bold text-green-400">{playerStats.partidos || 0}</div>
                    <div className="text-xs text-green-300">Partidos</div>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {playerStats.partidos && playerStats.partidos > 0 ? ((playerStats.saves || 0) / playerStats.partidos).toFixed(1) : "0"}
                    </div>
                    <div className="text-xs text-purple-300">Ataj/Partido</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-center">
                    <div className="text-2xl font-bold text-amber-400">{playerStats.goals || 0}</div>
                    <div className="text-xs text-amber-300">Goles</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-2xl font-bold text-purple-400">{playerStats.assists || 0}</div>
                    <div className="text-xs text-purple-300">Asistencias</div>
                  </div>
                </div>

                {/* Estadísticas avanzadas */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                    <div className="text-sm font-bold text-green-400">{playerStats.partidos || 0}</div>
                    <div className="text-xs text-green-300">Partidos</div>
                  </div>
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-center">
                    <div className="text-sm font-bold text-cyan-400">
                      {playerStats.partidos && playerStats.partidos > 0 ? ((playerStats.goals || 0) / playerStats.partidos).toFixed(1) : "0"}
                    </div>
                    <div className="text-xs text-cyan-300">G/P</div>
                  </div>
                  <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/30 text-center">
                    <div className="text-sm font-bold text-pink-400">
                      {((playerStats.goals || 0) + (playerStats.assists || 0)) || 0}
                    </div>
                    <div className="text-xs text-pink-300">G+A</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones de actualización mejoradas */}
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <h4 className="text-blue-400 font-bold mb-2 text-sm">💡 Actualizar estadísticas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-green-400 font-medium">🔄 REEMPLAZAR:</p>
              <p className="text-gray-300">"Llevo 10 goles en 15 partidos"</p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-400 font-medium">➕ SUMAR:</p>
              <p className="text-gray-300">"Hice 2 goles hoy"</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
