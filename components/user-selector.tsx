"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import type { Player, UserSession } from "@/lib/types"
import { User, Users, Star, UserPlus, Shield, LogOut } from "lucide-react"

interface UserSelectorProps {
  onUserSelect: (userSession: UserSession) => void
  currentUser: UserSession | null
}

export default function UserSelector({ onUserSelect, currentUser }: UserSelectorProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("")
  const [visitorName, setVisitorName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("player")

  useEffect(() => {
    loadPlayers()
  }, [])

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
            id: "4",
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
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("players").select("*").order("name", { ascending: true })

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error("Error loading players:", error)
    }
    setIsLoading(false)
  }

  const handlePlayerLogin = async () => {
    if (!selectedPlayerId) return

    const selectedPlayer = players.find((p) => p.id === selectedPlayerId)
    if (!selectedPlayer) return

    const userSession: UserSession = {
      name: selectedPlayer.name,
      type: "player",
      player_id: selectedPlayer.id,
      can_update_stats: true,
    }

    if (hasValidCredentials) {
      try {
        await supabase.from("visitors").insert({
          name: selectedPlayer.name,
        })
      } catch (error) {
        console.error("Error registering visitor:", error)
      }
    }

    onUserSelect(userSession)
  }

  const handleVisitorLogin = async () => {
    if (!visitorName.trim()) return

    const userSession: UserSession = {
      name: visitorName.trim(),
      type: "visitor",
      can_update_stats: false,
    }

    if (hasValidCredentials) {
      try {
        await supabase.from("visitors").insert({
          name: visitorName.trim(),
        })
      } catch (error) {
        console.error("Error registering visitor:", error)
      }
    }

    onUserSelect(userSession)
  }

  const handleLogout = () => {
    onUserSelect({
      name: "",
      type: "visitor",
      can_update_stats: false,
    })
  }

  if (currentUser && currentUser.name) {
    return (
      <Card className="mb-4 bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between text-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${currentUser.type === "player" ? "bg-green-500/20" : "bg-blue-500/20"}`}
              >
                {currentUser.type === "player" ? (
                  <User className="w-4 h-4 text-green-400" />
                ) : (
                  <Users className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <span className="font-bold">Sesión Activa</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentUser.type === "player" ? "⚽" : "👤"}</div>
              <div>
                <h3 className="text-white font-bold text-lg">{currentUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${
                      currentUser.type === "player"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    } text-xs`}
                  >
                    {currentUser.type === "player" ? "Jugador" : "Visitante"}
                  </Badge>
                  {currentUser.can_update_stats && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Auto-Stats
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2 text-lg">
          <Shield className="w-5 h-5 text-amber-400" />
          <span>Selecciona tu Perfil</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800 border border-gray-600 p-1 rounded-lg">
            <TabsTrigger
              value="player"
              className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 rounded py-2"
            >
              <User className="w-4 h-4" />
              <span>Jugador</span>
            </TabsTrigger>
            <TabsTrigger
              value="visitor"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-gray-400 rounded py-2"
            >
              <Users className="w-4 h-4" />
              <span>Visitante</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h3 className="text-green-400 font-bold mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Acceso de Jugador
              </h3>
              <p className="text-green-300/80 text-sm mb-3">
                Selecciona tu nombre para votar y actualizar estadísticas.
              </p>
              <div className="space-y-3">
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Selecciona tu nombre" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : (
                      players.map((player) => (
                        <SelectItem key={player.id} value={player.id} className="text-white hover:bg-gray-700">
                          <div className="flex items-center space-x-2">
                            <span>{player.name}</span>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">{player.team}</Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePlayerLogin}
                  disabled={!selectedPlayerId || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  Entrar como Jugador
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visitor" className="space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Acceso de Visitante
              </h3>
              <p className="text-blue-300/80 text-sm mb-3">
                Ingresa tu nombre para votar. No podrás actualizar estadísticas.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Tu nombre"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleVisitorLogin()}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleVisitorLogin}
                  disabled={!visitorName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Entrar como Visitante
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Diferencias:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-green-400 font-medium">Jugadores:</p>
              <ul className="text-gray-300 space-y-1 ml-2">
                <li>• Votan por MVP</li>
                <li>• Actualizan estadísticas</li>
                <li>• Aparecen en cartas</li>
              </ul>
            </div>
            <div>
              <p className="text-blue-400 font-medium">Visitantes:</p>
              <ul className="text-gray-300 space-y-1 ml-2">
                <li>• Solo votan por MVP</li>
                <li>• Leen el chat</li>
                <li>• No actualizan stats</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
