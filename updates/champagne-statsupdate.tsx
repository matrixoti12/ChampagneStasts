"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Trophy, Target, Users, Zap, Crown, Flame, RefreshCw, Brain, Sparkles, TrendingUp, Star } from "lucide-react"
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
            league_logo_url: "/placeholder.svg?height=48&width=48",
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
      const playersWithStats: PlayerStats[] = (data || []).map((player) => {
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
          league_logo_url: "/placeholder.svg?height=48&width=48",
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

  // Prepare data for different charts
  const topScorers = fieldPlayers
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 8)
    .map((player) => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + "..." : player.name,
      fullName: player.name,
      goals: player.goals || 0,
      partidos: player.partidos || 0,
      goals_per_match: player.goals_per_match,
      team: player.team,
      position: player.position,
    }))

  const topAssisters = fieldPlayers
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 8)
    .map((player) => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + "..." : player.name,
      fullName: player.name,
      assists: player.assists || 0,
      partidos: player.partidos || 0,
      assists_per_match: player.assists_per_match,
      team: player.team,
      position: player.position,
    }))

  const efficiencyLeaders = fieldPlayers
    .filter((p) => (p.partidos || 0) >= 5) // Solo jugadores con al menos 5 partidos
    .sort((a, b) => b.goals_per_match - a.goals_per_match)
    .slice(0, 6)
    .map((player) => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + "..." : player.name,
      fullName: player.name,
      goals_per_match: Number(player.goals_per_match.toFixed(2)),
      goals: player.goals || 0,
      partidos: player.partidos || 0,
      position: player.position,
    }))

  const topContributors = fieldPlayers.sort((a, b) => b.total_contributions - a.total_contributions).slice(0, 6)

  const gaRatioLeaders = fieldPlayers
    .filter((p) => (p.assists || 0) > 0)
    .sort((a, b) => b.ga_ratio - a.ga_ratio)
    .slice(0, 6)
    .map((player) => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + "..." : player.name,
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
          team: player.team,
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
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with AI */}
      <div className="text-center">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <Trophy className="w-12 h-12 text-amber-400" />
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
            LA CHAMPAGNE DE ORO
          </h1>
          <Brain className="w-12 h-12 text-purple-400" />
        </div>
        <p className="text-xl text-amber-200/80">Análisis Inteligente con IA - Goles, Asistencias y Eficiencia</p>

        <div className="flex justify-center items-center space-x-4 mt-6">
          <Badge className={hasValidCredentials ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
            {hasValidCredentials
              ? `📊 Datos Reales (${allPlayers.length} total, ${fieldPlayers.length} de campo)`
              : "🎮 Modo Demo"}
          </Badge>
          <Button onClick={loadPlayersStats} size="sm" variant="outline" className="bg-white/10 border-white/20">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button
            onClick={generateAIInsights}
            disabled={isGeneratingInsights}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isGeneratingInsights ? "Generando..." : "Análisis IA"}
          </Button>
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <span>Análisis Inteligente de la Liga</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Performer */}
            <div className="p-4 bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-lg border border-amber-500/20">
              <h3 className="text-amber-400 font-bold mb-3 flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Mejor Rendimiento: {aiInsights.top_performer.player_name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-400 text-sm font-medium">Fortalezas:</p>
                  <ul className="text-white/80 text-sm">
                    {aiInsights.top_performer.strengths.map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium">Áreas de mejora:</p>
                  <ul className="text-white/80 text-sm">
                    {aiInsights.top_performer.weaknesses.map((weakness, i) => (
                      <li key={i}>• {weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white/5 rounded">
                <p className="text-white/90 text-sm">{aiInsights.top_performer.comparison_text}</p>
              </div>
            </div>

            {/* League Summary */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h3 className="text-blue-400 font-bold mb-2">📊 Resumen de la Liga</h3>
              <p className="text-white/90">{aiInsights.league_summary}</p>
            </div>

            {/* Fun Facts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-bold mb-2">🎯 Predicciones IA</h3>
                <ul className="space-y-1">
                  {aiInsights.predictions.map((prediction, i) => (
                    <li key={i} className="text-white/80 text-sm">
                      • {prediction}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <h3 className="text-pink-400 font-bold mb-2">🎉 Datos Curiosos</h3>
                <ul className="space-y-1">
                  {aiInsights.fun_facts.map((fact, i) => (
                    <li key={i} className="text-white/80 text-sm">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scorers" className="w-full">
        <TabsList className="grid grid-cols-6 mb-8 bg-white/5 border border-white/10">
          <TabsTrigger
            value="scorers"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Target className="w-4 h-4" />
            <span>Goleadores</span>
          </TabsTrigger>
          <TabsTrigger
            value="assisters"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Users className="w-4 h-4" />
            <span>Asistentes</span>
          </TabsTrigger>
          <TabsTrigger
            value="efficiency"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Eficiencia</span>
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Zap className="w-4 h-4" />
            <span>G+A</span>
          </TabsTrigger>
          <TabsTrigger
            value="ratio"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Crown className="w-4 h-4" />
            <span>Ratio G/A</span>
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            className="flex items-center space-x-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Flame className="w-4 h-4" />
            <span>Equipos</span>
          </TabsTrigger>
        </TabsList>

        {/* Efficiency Tab - NEW */}
        <TabsContent value="efficiency">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span>Eficiencia Goleadora (Goles por Partido)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {efficiencyLeaders.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={efficiencyLeaders} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-green-500/20">
                                  <p className="text-green-400 font-bold">{data.fullName}</p>
                                  <p className="text-white text-sm">Eficiencia: {data.goals_per_match} goles/partido</p>
                                  <p className="text-amber-300">
                                    {data.goals} goles en {data.partidos} partidos
                                  </p>
                                  <p className="text-cyan-300 text-sm capitalize">{data.position}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="goals_per_match" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Efficiency Leaderboard */}
                  <div className="mt-8 space-y-3">
                    <h3 className="text-green-400 font-bold text-lg mb-4">🎯 Ranking de Eficiencia</h3>
                    {fieldPlayers
                      .filter((p) => (p.partidos || 0) >= 3)
                      .sort((a, b) => b.goals_per_match - a.goals_per_match)
                      .slice(0, 8)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-green-400">#{index + 1}</div>
                            <div>
                              <h3 className="text-white font-bold">{player.name}</h3>
                              <p className="text-green-400 text-sm">{player.team}</p>
                              <p className="text-cyan-300 text-xs capitalize">{player.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-xs text-white/60">Eficiencia</div>
                              <div className="text-xl font-black text-green-400">
                                {player.goals_per_match.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-white/60">Goles</div>
                              <div className="text-lg font-bold text-amber-400">{player.goals || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-white/60">Partidos</div>
                              <div className="text-lg font-bold text-blue-400">{player.partidos || 0}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/70">No hay suficientes datos de eficiencia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rest of the existing tabs with enhanced tooltips showing partidos */}
        <TabsContent value="scorers">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="w-6 h-6 text-amber-400" />
                <span>Máximos Goleadores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topScorers} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-amber-500/20">
                                  <p className="text-amber-400 font-bold">{data.fullName}</p>
                                  <p className="text-white text-sm">{data.team}</p>
                                  <p className="text-cyan-300 text-sm capitalize">{data.position}</p>
                                  <p className="text-amber-300">
                                    {data.goals} goles en {data.partidos} partidos
                                  </p>
                                  <p className="text-green-300">
                                    Promedio: {data.goals_per_match.toFixed(2)} goles/partido
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="goals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Enhanced Top 3 Podium with partidos */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {fieldPlayers
                      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                      .slice(0, 3)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`text-center p-4 rounded-xl ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border border-gray-400/30"
                                : "bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-600/30"
                          }`}
                        >
                          <div className="text-4xl mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                          <h3 className="text-white font-bold text-lg">{player.name}</h3>
                          <p className="text-amber-400 text-sm">{player.team}</p>
                          <p className="text-cyan-300 text-xs capitalize">{player.position}</p>
                          <div className="text-2xl font-black text-amber-400 mt-2">{player.goals || 0} goles</div>
                          <div className="text-sm text-green-400">{player.partidos || 0} partidos</div>
                          <div className="text-xs text-white/70">
                            {((player.goals || 0) / (player.partidos || 1)).toFixed(2)} por partido
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/70">No hay goleadores disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar enhancements for other tabs... */}
        <TabsContent value="assisters">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-400" />
                <span>Máximos Asistentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topAssisters.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topAssisters} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-purple-500/20">
                                  <p className="text-purple-400 font-bold">{data.fullName}</p>
                                  <p className="text-white text-sm">{data.team}</p>
                                  <p className="text-cyan-300 text-sm capitalize">{data.position}</p>
                                  <p className="text-purple-300">
                                    {data.assists} asistencias en {data.partidos} partidos
                                  </p>
                                  <p className="text-green-300">
                                    Promedio: {data.assists_per_match.toFixed(2)} asist/partido
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="assists" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Top 3 Podium for assists */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {fieldPlayers
                      .sort((a, b) => (b.assists || 0) - (a.assists || 0))
                      .slice(0, 3)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`text-center p-4 rounded-xl ${
                            index === 0
                              ? "bg-gradient-to-br from-purple-400/20 to-purple-500/20 border border-purple-400/30"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border border-gray-400/30"
                                : "bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-600/30"
                          }`}
                        >
                          <div className="text-4xl mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                          <h3 className="text-white font-bold text-lg">{player.name}</h3>
                          <p className="text-purple-400 text-sm">{player.team}</p>
                          <p className="text-cyan-300 text-xs capitalize">{player.position}</p>
                          <div className="text-2xl font-black text-purple-400 mt-2">
                            {player.assists || 0} asistencias
                          </div>
                          <div className="text-sm text-green-400">{player.partidos || 0} partidos</div>
                          <div className="text-xs text-white/70">
                            {((player.assists || 0) / (player.partidos || 1)).toFixed(2)} por partido
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/70">No hay asistentes disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other existing tabs but enhanced with partidos data... */}
        {/* For brevity, I'll include the key tabs. The pattern is the same for contributions, ratio, and teams */}

        <TabsContent value="contributions">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-6 h-6 text-emerald-400" />
                <span>Goles + Asistencias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topContributors.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topContributors.map((p) => ({
                          name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
                          fullName: p.name,
                          goals: p.goals || 0,
                          assists: p.assists || 0,
                          partidos: p.partidos || 0,
                          team: p.team,
                          position: p.position,
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-emerald-500/20">
                                  <p className="text-emerald-400 font-bold">{data.fullName}</p>
                                  <p className="text-white text-sm">{data.team}</p>
                                  <p className="text-cyan-300 text-sm capitalize">{data.position}</p>
                                  <p className="text-amber-300">{data.goals} goles</p>
                                  <p className="text-purple-300">{data.assists} asistencias</p>
                                  <p className="text-emerald-300">Total: {data.goals + data.assists}</p>
                                  <p className="text-green-300">{data.partidos} partidos</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="goals" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="assists" stackId="a" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Contributions Leaderboard */}
                  <div className="mt-8 space-y-3">
                    {topContributors.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-emerald-400">#{index + 1}</div>
                          <div>
                            <h3 className="text-white font-bold">{player.name}</h3>
                            <p className="text-emerald-400 text-sm">{player.team}</p>
                            <p className="text-cyan-300 text-xs capitalize">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <Badge className="bg-amber-500/20 text-amber-400">{player.goals || 0}G</Badge>
                          <Badge className="bg-purple-500/20 text-purple-400">{player.assists || 0}A</Badge>
                          <Badge className="bg-green-500/20 text-green-400">{player.partidos || 0}P</Badge>
                          <div className="text-2xl font-black text-emerald-400">{player.total_contributions}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/70">
                    {hasValidCredentials
                      ? `No hay jugadores de campo con contribuciones (${allPlayers.length} jugadores total)`
                      : "Configura Supabase para ver datos reales"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratio">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Crown className="w-6 h-6 text-red-400" />
                <span>Ratio Goles/Asistencias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gaRatioLeaders.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gaRatioLeaders} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-red-500/20">
                                  <p className="text-red-400 font-bold">{data.fullName}</p>
                                  <p className="text-white text-sm">Ratio G/A: {data.ga_ratio}</p>
                                  <p className="text-cyan-300 text-sm capitalize">{data.position}</p>
                                  <p className="text-amber-300">{data.goals} goles</p>
                                  <p className="text-purple-300">{data.assists} asistencias</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="ga_ratio" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* G/A Ratio Explanation */}
                  <div className="mt-8 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <h3 className="text-red-400 font-bold mb-2 flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      ¿Qué es el Ratio G/A?
                    </h3>
                    <p className="text-white/80 text-sm">
                      El ratio G/A mide la eficiencia goleadora dividiendo los goles entre las asistencias. Un ratio
                      alto indica un jugador más finalizador, mientras que un ratio bajo indica un jugador más creativo.
                    </p>
                  </div>

                  {/* Top G/A Ratios */}
                  <div className="mt-6 space-y-3">
                    {gaRatioLeaders.map((player, index) => (
                      <div
                        key={`${player.fullName}-${index}`}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-red-400">#{index + 1}</div>
                          <div>
                            <h3 className="text-white font-bold">{player.fullName}</h3>
                            <p className="text-red-400 text-sm">Ratio: {player.ga_ratio}</p>
                            <p className="text-cyan-300 text-xs capitalize">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-xs text-white/60">G/A</div>
                            <div className="text-xl font-black text-red-400">{player.ga_ratio}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-white/60">Goles</div>
                            <div className="text-lg font-bold text-amber-400">{player.goals}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-white/60">Asist</div>
                            <div className="text-lg font-bold text-purple-400">{player.assists}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/70">
                    {hasValidCredentials
                      ? `No hay jugadores de campo con asistencias (${allPlayers.length} jugadores total)`
                      : "Configura Supabase para ver datos reales"}
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Se necesitan jugadores con asistencias para calcular el ratio
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Goals Chart */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <span>Goles por Equipo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamStatsArray.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamStatsArray} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                          dataKey="team"
                          stroke="#ffffff80"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff80" />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-black/80 p-3 rounded-lg border border-orange-500/20">
                                  <p className="text-orange-400 font-bold">{data.team}</p>
                                  <p className="text-white">{data.goals} goles</p>
                                  <p className="text-purple-300">{data.assists} asistencias</p>
                                  <p className="text-white/70">{data.players} jugadores</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="goals" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/70">
                      {hasValidCredentials
                        ? `No hay equipos con goles (${allPlayers.length} jugadores total)`
                        : "Configura Supabase para ver datos reales"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Star className="w-6 h-6 text-blue-400" />
                  <span>Rendimiento por Equipo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamStatsArray.slice(0, 5).map((team, index) => (
                    <div
                      key={team.team}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-blue-400">#{index + 1}</div>
                        <div>
                          <h3 className="text-white font-bold">{team.team}</h3>
                          <p className="text-blue-400 text-sm">{team.players} jugadores</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-xs text-white/60">Goles</div>
                          <div className="text-lg font-bold text-amber-400">{team.goals}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-white/60">Asist</div>
                          <div className="text-lg font-bold text-purple-400">{team.assists}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-white/60">Total</div>
                          <div className="text-lg font-bold text-emerald-400">{team.total}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
