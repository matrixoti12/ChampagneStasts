"use client"

import { useState } from "react"
import type { Player } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Star, Users, Trophy, Zap, Crown, Flame, Repeat } from "lucide-react"

interface PlayerCardProps {
  player: Player
  onVote: (playerId: string) => void
  canVote: boolean
}

export default function PlayerCard({ player, onVote, canVote }: PlayerCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const designStyles = {
    glass: {
      card: "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
      photo: "rounded-2xl border-4 border-white/30 shadow-2xl backdrop-blur-sm",
      stats: "bg-white/10 backdrop-blur-xl border border-white/20",
      text: "text-white",
      accent: "text-cyan-300",
      bg: "bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600",
    },
    elite: {
      card: "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/20",
      photo: "rounded-3xl border-4 border-gradient-to-r border-yellow-400 shadow-2xl shadow-yellow-400/30",
      stats: "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30",
      text: "text-white",
      accent: "text-yellow-400",
      bg: "bg-black",
    },
    holographic: {
      card: "bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-xl border-2 border-transparent bg-clip-padding shadow-2xl",
      photo: "rounded-full border-4 border-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 p-1 shadow-2xl",
      stats: "bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 backdrop-blur-xl border border-white/20",
      text: "text-white",
      accent: "text-pink-300",
      bg: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    },
    diamond: {
      card: "bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-400 shadow-2xl shadow-emerald-400/30",
      photo: "transform rotate-45 border-4 border-emerald-600 shadow-2xl shadow-emerald-600/40",
      stats: "bg-gradient-to-r from-emerald-400/90 to-teal-400/90 border border-emerald-600",
      text: "text-emerald-900",
      accent: "text-emerald-700",
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    cosmic: {
      card: "bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80 backdrop-blur-xl border border-purple-400/30 shadow-2xl",
      photo: "rounded-2xl border-4 border-purple-400 shadow-2xl shadow-purple-400/50",
      stats: "bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 backdrop-blur-xl border border-purple-400/30",
      text: "text-white",
      accent: "text-purple-300",
      bg: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
    },
    fire: {
      card: "bg-gradient-to-br from-red-600/90 via-orange-500/90 to-yellow-500/90 border-2 border-red-400 shadow-2xl shadow-red-500/40",
      photo: "rounded-xl border-4 border-yellow-300 shadow-2xl shadow-orange-500/50",
      stats: "bg-gradient-to-r from-red-700/80 to-orange-700/80 border border-yellow-400",
      text: "text-white",
      accent: "text-yellow-200",
      bg: "bg-gradient-to-br from-red-800 to-orange-800",
    },
  }

  const calculateCardStyle = (player: Player) => {
    if (!player) return "glass"

    try {
      const { goals = 0, assists = 0, mvp_count = 0 } = player
      const totalGoals = Number(goals)
      const totalAssists = Number(assists)
      const totalMVP = Number(mvp_count)

      let points = 0
      if (player.position === "portero") {
        points += totalMVP * 6.5 // Mayor puntuación por MVP para porteros
      } else {
        points += totalGoals * 2
        points += totalAssists * 1
        points += totalMVP * 0.5
      }

      if (points >= 50) return "cosmic"
      if (points >= 40) return "diamond"
      if (points >= 30) return "fire"
      if (points >= 20) return "elite"
      if (points >= 10) return "holographic"
      return "glass"
    } catch (error) {
      console.error("Error calculando estilo de carta:", error)
      return "glass"
    }
  }

  const cardStyle = calculateCardStyle(player)
  const style = designStyles[cardStyle]

  const getRatingIcon = () => {
    if (cardStyle === "cosmic") return Zap
    if (cardStyle === "diamond") return Crown
    if (cardStyle === "fire") return Flame
    if (cardStyle === "elite") return Star
    if (cardStyle === "holographic") return Star
    return Star
  }

  const RatingIcon = getRatingIcon()

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsVoting(true)
      await onVote(player.id)
    } catch (error) {
      console.error("Error al votar:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsFlipped(prev => !prev)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const calculatePlayerRating = (player: Player) => {
    if (!player) return 1

    try {
      const { goals = 0, assists = 0, mvp_count = 0 } = player
      const totalGoals = Number(goals)
      const totalAssists = Number(assists)
      const totalMVP = Number(mvp_count)
      
      let rating = 1
      
      if (totalGoals >= 30) rating = 5
      else if (totalGoals >= 20) rating = 4
      else if (totalGoals >= 10) rating = 3
      else if (totalGoals >= 5) rating = 2

      if (totalAssists >= 20) rating = Math.min(rating + 1, 5)
      
      if (totalMVP >= 10) rating = 5
      else if (totalMVP >= 5) rating = Math.max(rating, 4)
      
      return rating
    } catch (error) {
      console.error("Error calculando rating:", error)
      return 1
    }
  }

  const getCardLevelInfo = (cardStyle: string) => {
    switch (cardStyle) {
      case "cosmic":
        return "🌟 Nivel MAX"
      case "diamond":
        return "💎 Nivel 4"
      case "fire":
        return "🔥 Nivel 3"
      case "elite":
        return "⭐ Nivel 2"
      case "holographic":
        return "✨ Nivel 1"
      default:
        return "🔮 Nivel 0"
    }
  }

  const calculatePoints = () => {
    if (!player) return 0

    try {
      const { goals = 0, assists = 0, mvp_count = 0 } = player
      const totalGoals = Number(goals)
      const totalAssists = Number(assists)
      const totalMVP = Number(mvp_count)

      let points = 0
      points += totalGoals * 2
      points += totalAssists * 1
      points += totalMVP * 0.5

      return Math.floor(points)
    } catch (error) {
      console.error("Error calculando puntos:", error)
      return 0
    }
  }

  const calculateProgress = () => {
    const points = calculatePoints()
    if (points >= 50) return 100
    const thresholds = [0, 10, 20, 30, 40, 50]
    let level = thresholds.findIndex(t => points < t) - 1
    level = level < 0 ? 0 : level
    const currentThreshold = thresholds[level]
    const nextThreshold = thresholds[level + 1]
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  return (
    <div className={`${style.bg} p-1 rounded-3xl transform hover:scale-105 transition-all duration-500 flex flex-col gap-2 group`}>
      <div className="w-72 h-[500px] [perspective:1000px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] cursor-pointer ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Frente de la carta */}
          {/* Frente de la carta (visible por defecto) */}
          <div className={`w-full h-full rounded-3xl p-4 ${style.card} absolute inset-0 [backface-visibility:hidden] [transform:rotateY(0deg)]`}>
            {/* Contenido frontal */}
            <div className="relative z-10">
              {/* Logos */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  {player.league_logo_url && player.league_logo_url !== "/placeholder.svg" ? (
                    <img
                      src={player.league_logo_url}
                      alt="Liga"
                      className="w-10 h-10 rounded-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) {
                          sibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : (
                    <Trophy className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  {player.team_logo_url && player.team_logo_url !== "/placeholder.svg" ? (
                    <img
                      src={player.team_logo_url}
                      alt="Equipo"
                      className="w-10 h-10 rounded-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) {
                          sibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : (
                    <Users className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>

              {/* Foto y nombre */}
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-40 h-44 ${style.photo} overflow-hidden flex items-center justify-center mt-2`}>
                  {!imageError && player.photo && player.photo !== "/placeholder.svg" ? (
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="w-full h-full object-contain transform scale-110"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className={`text-2xl font-black tracking-wide ${style.text}`}>
                    {player.name.toUpperCase()}
                  </h3>
                  <div className={`text-xs font-semibold ${style.accent} mt-2`}>
                    {player.position.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Nivel y progreso */}
              <div className="mt-4 space-y-2">
                <div className={`text-center ${style.text} opacity-80`}>
                  {getCardLevelInfo(cardStyle)}
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      cardStyle === "glass" ? "bg-white/40" :
                      cardStyle === "holographic" ? "bg-gradient-to-r from-pink-400 to-cyan-400" :
                      cardStyle === "elite" ? "bg-gradient-to-r from-yellow-400 to-amber-600" :
                      cardStyle === "fire" ? "bg-gradient-to-r from-red-500 to-orange-500" :
                      cardStyle === "diamond" ? "bg-gradient-to-r from-emerald-300 to-teal-500" :
                      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    }`}
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              {/* Estadísticas básicas */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {player.position === "portero" ? (
                  <>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.saves || 0}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>Saves</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.assists || 0}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>Asist</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.mvp_count}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>MVP</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.goals || 0}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>Goles</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.assists || 0}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>Asist</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${style.accent}`}>{player.mvp_count}</div>
                      <div className={`text-xs ${style.text} opacity-80`}>MVP</div>
                    </div>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex justify-center mt-3 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <RatingIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < calculatePlayerRating(player) ? `${style.accent} fill-current` : `${style.text} opacity-30`
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reverso de la carta */}
          {/* Reverso de la carta (rotado 180 grados inicialmente) */}
          <div className={`w-full h-full rounded-3xl p-6 ${style.card} absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-black ${style.text}`}>{player.name}</h2>
                <p className={`text-sm ${style.accent}`}>{player.team}</p>
              </div>

              <div className={`${style.stats} rounded-xl p-4`}>
                <h3 className={`text-lg font-bold ${style.text} mb-3`}>Estadísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {player.position === "portero" ? (
                    <>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.saves || 0}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>Atajadas</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.partidos || 0}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>Partidos</div>
                      </div>
                      <div className="text-center col-span-2">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.mvp_count}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>MVP</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.goals || 0}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>Goles</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.assists || 0}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>Asistencias</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.partidos || 0}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>Partidos</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${style.accent}`}>{player.mvp_count}</div>
                        <div className={`text-xs ${style.text} opacity-80`}>MVP</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {player.descripcion && (
                <div className={`${style.stats} rounded-xl p-4 overflow-auto max-h-[150px]`}>
                  <h3 className={`text-lg font-bold ${style.text} mb-2`}>Descripción</h3>
                  <p className={`text-sm ${style.text} opacity-90 leading-relaxed`}>
                    {player.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de votación (fuera de la carta) */}
      {canVote && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleVote(e)
          }}
          disabled={isVoting}
          className={`w-72 font-bold py-2 rounded-xl shadow-lg border-none transition-all duration-300 ${
            isVoting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
          }`}
        >
          <span className="flex items-center justify-center">
            {isVoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-white mr-2"></div>
                Votando...
              </>
            ) : (
              "Votar MVP"
            )}
          </span>
        </Button>
      )}
    </div>
  )
}
