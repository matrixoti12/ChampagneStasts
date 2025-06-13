"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Trophy, Target, Users, Crown, RefreshCw, Brain, Sparkles, TrendingUp, Building2, Zap } from "lucide-react"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { generateChampagneInsights, type ChampagneInsights } from "@/lib/champagne-ai-service"
import type { Player } from "@/lib/types"

interface PlayerStats extends Player {
  ga_ratio: number
  total_contributions: number
  goals_per_match: number
  assists_per_match: number
}

export default function ChampagneStats() {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [aiInsights, setAiInsights] = useState<ChampagneInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  useEffect(() => {
    loadPlayersStats()
  }, [])

  const loadPlayersStats = async () => {
    setIsLoading(true)
    try {
      if (!hasValidCredentials) {
        // Mock data with Spanish positions and partidos
        const mockPlayers: PlayerStats[] = [
          {
            id: "1",
            name: "Messi",
            team: "Inter Miami",
            position: "delantero",
            goals: 15,
            assists: 12,
            saves: 0,
            partidos: 18,
            mvp_count: 8,
            rating: 5,
            card_style: "cosmic",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 1.25,
            total_contributions: 27,
            goals_per_match: 0.83,
            assists_per_match: 0.67,
          },
          {
            id: "2",
            name: "Cristiano",
            team: "Al Nassr",
            position: "delantero",
            goals: 18,
            assists: 6,
            saves: 0,
            partidos: 20,
            mvp_count: 7,
            rating: 5,
            card_style: "elite",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 3.0,
            total_contributions: 24,
            goals_per_match: 0.9,
            assists_per_match: 0.3,
          },
          {
            id: "3",
            name: "Mbappé",
            team: "PSG",
            position: "delantero",
            goals: 22,
            assists: 8,
            saves: 0,
            partidos: 24,
            mvp_count: 9,
            rating: 5,
            card_style: "fire",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 2.75,
            total_contributions: 30,
            goals_per_match: 0.92,
            assists_per_match: 0.33,
          },
          {
            id: "4",
            name: "Haaland",
            team: "Manchester City",
            position: "delantero",
            goals: 25,
            assists: 4,
            saves: 0,
            partidos: 22,
            mvp_count: 6,
            rating: 5,
            card_style: "diamond",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 6.25,
            total_contributions: 29,
            goals_per_match: 1.14,
            assists_per_match: 0.18,
          },
          {
            id: "5",
            name: "De Bruyne",
            team: "Manchester City",
            position: "medio",
            goals: 8,
            assists: 16,
            saves: 0,
            partidos: 20,
            mvp_count: 5,
            rating: 5,
            card_style: "elite",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 0.5,
            total_contributions: 24,
            goals_per_match: 0.4,
            assists_per_match: 0.8,
          },
          {
            id: "6",
            name: "Tacua",
            team: "Deportivo Saprissa",
            position: "delantero",
            goals: 3,
            assists: 2,
            saves: 0,
            partidos: 8,
            mvp_count: 0,
            rating: 4,
            card_style: "glass",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/images/champagne-league-logo.png",
            team_logo_url: "/placeholder.svg?height=48&width=48",
            ga_ratio: 1.5,
            total_contributions: 5,
            goals_per_match: 0.38,
            assists_per_match: 0.25,
          },
        ]

        setPlayers(mockPlayers)
        setAllPlayers(mockPlayers)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("players").select("*").order("mvp_count", { ascending: false })

      if (error) throw error

      setAllPlayers(data || [])

      // Calculate enhanced stats including partidos
      const playersWithStats: PlayerStats[] = (data || []).map((player: Player) => {
        const goals = player.goals || 0
        const assists = player.assists || 0
        const partidos = player.partidos || 1 // Evitar división por 0
        const ga_ratio = assists > 0 ? goals / assists : goals
        const total_contributions = goals + assists
        const goals_per_match = partidos > 0 ? goals / partidos : 0
        const assists_per_match = partidos > 0 ? assists / partidos : 0

        return {
          ...player,
          ga_ratio,
          total_contributions,
          goals_per_match,
          assists_per_match,
        }
      })

      setPlayers(playersWithStats)
    } catch (error) {
      console.error("Error loading player stats:", error)
      // Fallback to mock data
      const mockPlayers: PlayerStats[] = [
        {
          id: "1",
          name: "Messi",
          team: "Inter Miami",
          position: "delantero",
          goals: 15,
          assists: 12,
          saves: 0,
          partidos: 18,
          mvp_count: 8,
          rating: 5,
          card_style: "cosmic",
          photo: "/placeholder.svg?height=144&width=144",
          league_logo_url: "/images/champagne-league-logo.png",
          team_logo_url: "/placeholder.svg?height=48&width=48",
          ga_ratio: 1.25,
          total_contributions: 27,
          goals_per_match: 0.83,
          assists_per_match: 0.67,
        },
      ]
      setPlayers(mockPlayers)
      setAllPlayers(mockPlayers)
    }
    setIsLoading(false)
  }

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      const insights = await generateChampagneInsights(players)
      setAiInsights(insights)
    } catch (error) {
      console.error("Error generating AI insights:", error)
      alert("Error generando insights con IA")
    }
    setIsGeneratingInsights(false)
  }

  // Filter field players (not goalkeepers)
  const fieldPlayers = players.filter((p) => p.position !== "portero")

  // Prepare data for different charts - Mobile optimized
  const topScorers = fieldPlayers
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 6) // Reduced for mobile
    .map((player) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      fullName: player.name,
      goals: player.goals || 0,
      partidos: player.partidos || 0,
      goals_per_match: player.goals_per_match,
      team: player.team,
      position: player.position,
    }))

  const topAssisters = fieldPlayers
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 6) // Reduced for mobile
    .map((player) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      fullName: player.name,
      assists: player.assists || 0,
      partidos: player.partidos || 0,
      assists_per_match: player.assists_per_match,
      team: player.team,
      position: player.position,
    }))

  const efficiencyLeaders = fieldPlayers
    .filter((p) => (p.partidos || 0) >= 3) // Solo jugadores con al menos 3 partidos
    .sort((a, b) => b.goals_per_match - a.goals_per_match)
    .slice(0, 5) // Reduced for mobile
    .map((player) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      fullName: player.name,
      goals_per_match: Number(player.goals_per_match.toFixed(2)),
      goals: player.goals || 0,
      partidos: player.partidos || 0,
      position: player.position,
    }))

  const topContributors = fieldPlayers.sort((a, b) => b.total_contributions - a.total_contributions).slice(0, 5)

  const gaRatioLeaders = fieldPlayers
    .filter((p) => (p.assists || 0) > 0)
    .sort((a, b) => b.ga_ratio - a.ga_ratio)
    .slice(0, 5) // Reduced for mobile
    .map((player) => ({
      name: player.name.length > 8 ? player.name.substring(0, 8) + "..." : player.name,
      fullName: player.name,
      ga_ratio: Number(player.ga_ratio.toFixed(2)),
      goals: player.goals || 0,
      assists: player.assists || 0,
      position: player.position,
    }))

  // Team stats
  const teamStats = fieldPlayers.reduce(
    (acc, player) => {
      if (!acc[player.team]) {
        acc[player.team] = {
          team: player.team.length > 12 ? player.team.substring(0, 12) + "..." : player.team,
          fullTeam: player.team,
          goals: 0,
          assists: 0,
          players: 0,
          total: 0,
        }
      }
      acc[player.team].goals += player.goals || 0
      acc[player.team].assists += player.assists || 0
      acc[player.team].players += 1
      acc[player.team].total = acc[player.team].goals + acc[player.team].assists
      return acc
    },
    {} as Record<string, any>,
  )

  const teamStatsArray = Object.values(teamStats)
    .sort((a: any, b: any) => b.goals - a.goals)
    .slice(0, 6) // Reduced for mobile
    .map((team: any, index) => ({
      ...team,
      fill: `hsl(${index * 60}, 70%, 60%)`,
    }))

  // Chart configuration
  const chartConfig = {
    goals: {
      label: "Goles",
      color: "#f59e0b",
    },
    assists: {
      label: "Asistencias",
      color: "#8b5cf6",
    },
    goals_per_match: {
      label: "Goles/Partido",
      color: "#ef4444",
    },
    partidos: {
      label: "Partidos",
      color: "#10b981",
    },
    total: {
      label: "Total",
      color: "#06b6d4",
    },
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Header with AI - Mobile Optimized */}
      <div className="text-center px-2">
        <div className="flex justify-center items-center space-x-2 mb-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
            CHAMPAGNE DE ORO
          </h1>
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-sm md:text-lg text-amber-200/80">Análisis Inteligente con IA</p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
          <Badge
            className={
              hasValidCredentials
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }
          >
            {hasValidCredentials
              ? `📊 Datos Reales (${allPlayers.length} total, ${fieldPlayers.length} de campo)`
              : "🎮 Modo Demo"}
          </Badge>
          <div className="flex space-x-2">
            <Button
              onClick={loadPlayersStats}
              size="sm"
              variant="outline"
              className="bg-gray-800 border-gray-600 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Actualizar
            </Button>
            <Button
              onClick={generateAIInsights}
              disabled={isGeneratingInsights}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs"
            >
              <Brain className="w-3 h-3 mr-1" />
              {isGeneratingInsights ? "Generando..." : "Análisis IA"}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights Panel - Mobile Optimized */}
      {aiInsights && (
        <Card className="bg-gray-900 border-gray-700 mx-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-lg">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Análisis IA</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Performer - Mobile Optimized */}
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <h3 className="text-amber-400 font-bold mb-2 flex items-center text-sm">
                <Crown className="w-4 h-4 mr-1" />
                Mejor: {aiInsights.top_performer.player_name}
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-green-400 text-xs font-medium">Fortalezas:</p>
                  <ul className="text-gray-300 text-xs">
                    {aiInsights.top_performer.strengths.slice(0, 2).map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-gray-800 rounded text-xs">
                  <p className="text-gray-300">{aiInsights.top_performer.comparison_text}</p>
                </div>
              </div>
            </div>

            {/* League Summary - Mobile Optimized */}
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-2 text-sm">📊 Resumen</h3>
              <p className="text-gray-300 text-xs">{aiInsights.league_summary}</p>
            </div>

            {/* Fun Facts - Mobile Grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <h3 className="text-green-400 font-bold mb-2 text-sm">🎯 Predicciones</h3>
                <ul className="space-y-1">
                  {aiInsights.predictions.slice(0, 2).map((prediction, i) => (
                    <li key={i} className="text-gray-300 text-xs">
                      • {prediction}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/30">
                <h3 className="text-pink-400 font-bold mb-2 text-sm">🎉 Datos Curiosos</h3>
                <ul className="space-y-1">
                  {aiInsights.fun_facts.slice(0, 2).map((fact, i) => (
                    <li key={i} className="text-gray-300 text-xs">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-First Tabs - FIXED */}
      <div className="px-2">
        <Tabs defaultValue="scorers" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-gray-900 border border-gray-700 w-full h-auto">
            <TabsTrigger
              value="scorers"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 text-xs min-h-[60px]"
            >
              <Target className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Goles</span>
            </TabsTrigger>
            <TabsTrigger
              value="assisters"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 text-xs min-h-[60px]"
            >
              <Users className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Asist</span>
            </TabsTrigger>
            <TabsTrigger
              value="efficiency"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 text-xs min-h-[60px]"
            >
              <TrendingUp className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Efic</span>
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 text-xs min-h-[60px]"
            >
              <Building2 className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Equipos</span>
            </TabsTrigger>
            <TabsTrigger
              value="ratio"
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 text-xs min-h-[60px]"
            >
              <Zap className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-center leading-tight">Ratio</span>
            </TabsTrigger>
          </TabsList>

          {/* Efficiency Tab - Mobile Optimized */}
          <TabsContent value="efficiency">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Eficiencia (Goles/Partido)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {efficiencyLeaders.length > 0 ? (
                  <>
                    {/* Mobile Chart - Smaller and optimized */}
                    <div className="w-full overflow-hidden">
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={efficiencyLeaders} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="name"
                              stroke="#9ca3af"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={10}
                            />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-2 rounded border border-green-500/30">
                                      <p className="text-green-400 font-bold text-sm">{data.fullName}</p>
                                      <p className="text-white text-xs">Eficiencia: {data.goals_per_match}</p>
                                      <p className="text-amber-300 text-xs">
                                        {data.goals} goles en {data.partidos} partidos
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="goals_per_match" fill="#10b981" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Mobile Leaderboard */}
                    <div className="mt-6 space-y-2">
                      <h3 className="text-green-400 font-bold text-base mb-3">🎯 Top Eficiencia</h3>
                      {fieldPlayers
                        .filter((p) => (p.partidos || 0) >= 3)
                        .sort((a, b) => b.goals_per_match - a.goals_per_match)
                        .slice(0, 5)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-lg font-bold text-green-400">#{index + 1}</div>
                              <div>
                                <h3 className="text-white font-bold text-sm">{player.name}</h3>
                                <p className="text-green-400 text-xs">{player.team}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center">
                                <div className="text-xs text-gray-400">Efic</div>
                                <div className="text-lg font-black text-green-400">
                                  {player.goals_per_match.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-400">G</div>
                                <div className="text-sm font-bold text-amber-400">{player.goals || 0}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-400">P</div>
                                <div className="text-sm font-bold text-blue-400">{player.partidos || 0}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No hay suficientes datos de eficiencia</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scorers Tab - Mobile Optimized */}
          <TabsContent value="scorers">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Máximos Goleadores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScorers.length > 0 ? (
                  <>
                    {/* Mobile Chart */}
                    <div className="w-full overflow-hidden">
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topScorers} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="name"
                              stroke="#9ca3af"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={10}
                            />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-2 rounded border border-amber-500/30">
                                      <p className="text-amber-400 font-bold text-sm">{data.fullName}</p>
                                      <p className="text-white text-xs">{data.team}</p>
                                      <p className="text-amber-300 text-xs">
                                        {data.goals} goles en {data.partidos} partidos
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="goals" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Mobile Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-2 mt-6">
                      {fieldPlayers
                        .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                        .slice(0, 3)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`text-center p-3 rounded-lg ${
                              index === 0
                                ? "bg-yellow-400/10 border border-yellow-400/30"
                                : index === 1
                                  ? "bg-gray-400/10 border border-gray-400/30"
                                  : "bg-amber-600/10 border border-amber-600/30"
                            }`}
                          >
                            <div className="text-2xl mb-1">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                            <h3 className="text-white font-bold text-xs">{player.name}</h3>
                            <p className="text-amber-400 text-xs">{player.team}</p>
                            <div className="text-lg font-black text-amber-400 mt-1">{player.goals || 0}</div>
                            <div className="text-xs text-gray-400">{player.partidos || 0} partidos</div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No hay goleadores disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assisters Tab - Mobile Optimized */}
          <TabsContent value="assisters">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Máximos Asistentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topAssisters.length > 0 ? (
                  <>
                    {/* Mobile Chart */}
                    <div className="w-full overflow-hidden">
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topAssisters} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="name"
                              stroke="#9ca3af"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={10}
                            />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-2 rounded border border-purple-500/30">
                                      <p className="text-purple-400 font-bold text-sm">{data.fullName}</p>
                                      <p className="text-white text-xs">{data.team}</p>
                                      <p className="text-purple-300 text-xs">
                                        {data.assists} asistencias en {data.partidos} partidos
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="assists" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Mobile Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-2 mt-6">
                      {fieldPlayers
                        .sort((a, b) => (b.assists || 0) - (a.assists || 0))
                        .slice(0, 3)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`text-center p-3 rounded-lg ${
                              index === 0
                                ? "bg-purple-400/10 border border-purple-400/30"
                                : index === 1
                                  ? "bg-gray-400/10 border border-gray-400/30"
                                  : "bg-purple-600/10 border border-purple-600/30"
                            }`}
                          >
                            <div className="text-2xl mb-1">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                            <h3 className="text-white font-bold text-xs">{player.name}</h3>
                            <p className="text-purple-400 text-xs">{player.team}</p>
                            <div className="text-lg font-black text-purple-400 mt-1">{player.assists || 0}</div>
                            <div className="text-xs text-gray-400">{player.partidos || 0} partidos</div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No hay asistentes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab - RESTORED */}
          <TabsContent value="teams">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span>Estadísticas por Equipos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamStatsArray.length > 0 ? (
                  <>
                    {/* Mobile Chart */}
                    <div className="w-full overflow-hidden">
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={teamStatsArray} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="team"
                              stroke="#9ca3af"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={10}
                            />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-2 rounded border border-cyan-500/30">
                                      <p className="text-cyan-400 font-bold text-sm">{data.fullTeam}</p>
                                      <p className="text-white text-xs">Goles: {data.goals}</p>
                                      <p className="text-purple-300 text-xs">Asistencias: {data.assists}</p>
                                      <p className="text-cyan-300 text-xs">Jugadores: {data.players}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="goals" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Team Rankings */}
                    <div className="mt-6 space-y-2">
                      <h3 className="text-cyan-400 font-bold text-base mb-3">🏆 Ranking de Equipos</h3>
                      {teamStatsArray.map((team: any, index) => (
                        <div
                          key={team.fullTeam}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-bold text-cyan-400">#{index + 1}</div>
                            <div>
                              <h3 className="text-white font-bold text-sm">{team.fullTeam}</h3>
                              <p className="text-cyan-400 text-xs">{team.players} jugadores</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">G</div>
                              <div className="text-lg font-black text-amber-400">{team.goals}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">A</div>
                              <div className="text-sm font-bold text-purple-400">{team.assists}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Total</div>
                              <div className="text-sm font-bold text-cyan-400">{team.total}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No hay datos de equipos disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ratio Tab - RESTORED */}
          <TabsContent value="ratio">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span>Ratio Goles/Asistencias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gaRatioLeaders.length > 0 ? (
                  <>
                    {/* Mobile Chart */}
                    <div className="w-full overflow-hidden">
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gaRatioLeaders} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="name"
                              stroke="#9ca3af"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              fontSize={10}
                            />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-2 rounded border border-orange-500/30">
                                      <p className="text-orange-400 font-bold text-sm">{data.fullName}</p>
                                      <p className="text-white text-xs">Ratio G/A: {data.ga_ratio}</p>
                                      <p className="text-orange-300 text-xs">
                                        {data.goals} goles / {data.assists} asistencias
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="ga_ratio" fill="#f97316" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Ratio Rankings */}
                    <div className="mt-6 space-y-2">
                      <h3 className="text-orange-400 font-bold text-base mb-3">⚡ Top Ratio G/A</h3>
                      <p className="text-gray-400 text-xs mb-3">
                        Ratio alto = más goleador | Ratio bajo = más asistente
                      </p>
                      {gaRatioLeaders.map((player, index) => (
                        <div
                          key={player.fullName}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-bold text-orange-400">#{index + 1}</div>
                            <div>
                              <h3 className="text-white font-bold text-sm">{player.fullName}</h3>
                              <p className="text-orange-400 text-xs">{player.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Ratio</div>
                              <div className="text-lg font-black text-orange-400">{player.ga_ratio}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">G</div>
                              <div className="text-sm font-bold text-amber-400">{player.goals}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">A</div>
                              <div className="text-sm font-bold text-purple-400">{player.assists}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No hay datos de ratio disponibles</p>
                    <p className="text-gray-500 text-sm">Se necesitan jugadores con asistencias</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
