"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import {
  analyzeMessageForAutoUpdate,
  generateSmartResponse,
  updatePlayerStatsInDatabase,
  performAutoCleanup,
  type AutoUpdateResult,
} from "@/lib/enhanced-ai-service"
import type { UserSession } from "@/lib/types"
import PlayerStatsDisplay from "@/components/player-stats-display"
import { Send, Trash2, Brain, Zap, TrendingUp, Users, Target, Lock } from "lucide-react"

interface Comment {
  id: string
  user_name: string
  message: string
  is_processed: boolean
  created_at: string
}

interface EnhancedStatsChatProps {
  userSession: UserSession | null
}

export default function EnhancedStatsChat({ userSession }: EnhancedStatsChatProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoUpdateResults, setAutoUpdateResults] = useState<Record<string, AutoUpdateResult>>({})
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComments()
    checkAutoCleanup()

    if (hasValidCredentials) {
      const subscription = supabase
        .channel("comments")
        .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
          loadComments()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const checkAutoCleanup = async () => {
    if (!hasValidCredentials) return

    try {
      const cleanupPerformed = await performAutoCleanup(supabase)
      if (cleanupPerformed) {
        console.log("🧹 Auto-cleanup realizada")
        loadComments()
      }

      const { data: lastCleanupData } = await supabase
        .from("auto_cleanups")
        .select("cleanup_date")
        .order("cleanup_date", { ascending: false })
        .limit(1)

      if (lastCleanupData && lastCleanupData.length > 0) {
        setLastCleanup(new Date(lastCleanupData[0].cleanup_date))
      }
    } catch (error) {
      console.error("Error checking auto-cleanup:", error)
    }
  }

  const loadComments = async () => {
    setIsLoading(true)
    try {
      if (!hasValidCredentials) {
        const mockComments: Comment[] = [
          {
            id: "1",
            user_name: "🤖 Sistema",
            message:
              "¡Bienvenidos al Chat de Estadísticas Inteligente! Los jugadores pueden escribir sus estadísticas y se actualizarán automáticamente. Ejemplos: 'Llevo 10 goles en 15 partidos' (reemplaza) o 'Hice 2 goles hoy' (suma)",
            is_processed: true,
            created_at: new Date().toISOString(),
          },
        ]
        setComments(mockComments)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error("Error loading comments:", error)
    }
    setIsLoading(false)
  }

  const processMessageWithAI = async (message: string, commentId: string, userName: string) => {
    setIsProcessing(true)
    try {
      if (userSession?.type === "player" && userSession.can_update_stats) {
        const statsDetected = await analyzeMessageForAutoUpdate(message, userName)

        if (statsDetected.length > 0 && hasValidCredentials) {
          const validStats = statsDetected.filter((stat) => stat.player_name === userName)

          if (validStats.length > 0) {
            const updateResult = await updatePlayerStatsInDatabase(validStats, supabase)

            setAutoUpdateResults((prev) => ({
              ...prev,
              [commentId]: updateResult,
            }))

            const smartResponse = await generateSmartResponse(message, userName, validStats)

            if (updateResult.success) {
              await supabase.from("comments").insert({
                user_name: "🤖 IA Assistant",
                message: smartResponse,
                is_processed: true,
              })
            }
          } else {
            setAutoUpdateResults((prev) => ({
              ...prev,
              [commentId]: {
                success: false,
                updated_players: [],
                message: "🔒 Solo puedes actualizar tus propias estadísticas",
                stats_detected: [],
              },
            }))
          }
        } else {
          const response = await generateSmartResponse(message, userName, [])
          setAutoUpdateResults((prev) => ({
            ...prev,
            [commentId]: {
              success: false,
              updated_players: [],
              message: response,
              stats_detected: [],
            },
          }))
        }
      } else {
        setAutoUpdateResults((prev) => ({
          ...prev,
          [commentId]: {
            success: false,
            updated_players: [],
            message: "👥 Como visitante, puedes leer y votar, pero no actualizar estadísticas",
            stats_detected: [],
          },
        }))
      }
    } catch (error) {
      console.error("Error processing message with AI:", error)
      setAutoUpdateResults((prev) => ({
        ...prev,
        [commentId]: {
          success: false,
          updated_players: [],
          message: "❌ Error procesando mensaje",
          stats_detected: [],
        },
      }))
    }
    setIsProcessing(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userSession?.name) return

    setIsSending(true)
    try {
      const commentData = {
        user_name: userSession.name,
        message: newMessage.trim(),
        is_processed: false,
      }

      if (!hasValidCredentials) {
        const newComment: Comment = {
          id: Date.now().toString(),
          ...commentData,
          created_at: new Date().toISOString(),
        }
        setComments((prev) => [...prev, newComment])

        setTimeout(() => {
          processMessageWithAI(newComment.message, newComment.id, userSession.name)
        }, 1000)

        setNewMessage("")
        setIsSending(false)
        return
      }

      const { data, error } = await supabase.from("comments").insert(commentData).select().single()

      if (error) throw error

      if (data) {
        processMessageWithAI(data.message, data.id, userSession.name)
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar mensaje")
    }
    setIsSending(false)
  }

  const clearChat = async () => {
    if (!confirm("¿Estás seguro de que quieres limpiar todo el chat?")) return

    if (!hasValidCredentials) {
      setComments([])
      setAutoUpdateResults({})
      return
    }

    try {
      const { error } = await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) throw error

      setComments([])
      setAutoUpdateResults({})
      alert("Chat limpiado exitosamente")
    } catch (error) {
      console.error("Error clearing chat:", error)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getNextCleanupDate = () => {
    if (!lastCleanup) return "Próximamente"
    const nextCleanup = new Date(lastCleanup.getTime() + 14 * 24 * 60 * 60 * 1000)
    return nextCleanup.toLocaleDateString("es-ES")
  }

  const canWriteInChat = userSession && userSession.name
  const canUpdateStats = userSession?.type === "player" && userSession.can_update_stats

  return (
    <div className="space-y-4">
      {/* Mostrar estadísticas del jugador si está logueado como jugador */}
      {userSession?.type === "player" && <PlayerStatsDisplay userSession={userSession} />}

      {/* Header con información del sistema - Mobile Optimized */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-base">Chat IA</span>
            </div>
            <div className="flex items-center space-x-2">
              {canUpdateStats && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Auto
                </Badge>
              )}
              {userSession?.name === "German Rauda" && (
                <Button onClick={clearChat} size="sm" variant="destructive" className="text-xs px-2 py-1">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Mobile-optimized info cards */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300 text-xs">
                {canUpdateStats ? "Detección automática activa" : "Solo lectura"}
              </span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
              <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-300 text-xs">Chat en tiempo real</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
              <Target className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300 text-xs">Limpieza auto: {getNextCleanupDate()}</span>
            </div>
          </div>

          {/* Instructions - Mobile Optimized */}
          {canUpdateStats ? (
            <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-sm font-medium mb-2">💡 Jugador:</p>
              <div className="space-y-1 text-xs">
                <p className="text-green-300">• "Llevo 10 goles en 15 partidos" → REEMPLAZA</p>
                <p className="text-green-300">• "Hice 2 goles hoy" → SUMA</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-blue-400 text-sm font-medium mb-1">👥 Visitante:</p>
              <p className="text-blue-300 text-xs">Puedes leer el chat y votar, pero no actualizar estadísticas.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Messages - Mobile Optimized */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto space-y-3 p-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Mensaje original */}
                    <div
                      className={`p-3 rounded-lg ${
                        comment.user_name.includes("🤖")
                          ? "bg-purple-500/10 border border-purple-500/30"
                          : comment.user_name === userSession?.name
                            ? "bg-blue-500/10 border border-blue-500/30 ml-4"
                            : "bg-gray-800 border border-gray-600 mr-4"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-medium text-sm ${
                              comment.user_name.includes("🤖")
                                ? "text-purple-400"
                                : comment.user_name === userSession?.name
                                  ? "text-blue-400"
                                  : "text-gray-300"
                            }`}
                          >
                            {comment.user_name}
                          </span>
                          {!comment.user_name.includes("🤖") && (
                            <Badge
                              className={`text-xs ${
                                comment.user_name === userSession?.name && userSession?.type === "player"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }`}
                            >
                              {comment.user_name === userSession?.name && userSession?.type === "player"
                                ? "Jugador"
                                : "Visitante"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {comment.is_processed && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓</Badge>
                          )}
                          <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">{comment.message}</p>
                    </div>

                    {/* Resultado de auto-actualización */}
                    {autoUpdateResults[comment.id] && (
                      <div
                        className={`ml-2 p-3 rounded-lg border text-sm ${
                          autoUpdateResults[comment.id].success
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-purple-400">IA:</span>
                        </div>
                        <p className="text-gray-200 text-xs leading-relaxed">{autoUpdateResults[comment.id].message}</p>

                        {autoUpdateResults[comment.id].stats_detected.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {autoUpdateResults[comment.id].stats_detected.map((stat, index) => (
                              <div key={index} className="flex space-x-1">
                                {stat.goals !== undefined && (
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                    {stat.update_type === "replace" ? "=" : "+"}
                                    {stat.goals}G
                                  </Badge>
                                )}
                                {stat.assists !== undefined && (
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                    {stat.update_type === "replace" ? "=" : "+"}
                                    {stat.assists}A
                                  </Badge>
                                )}
                                {stat.saves !== undefined && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    {stat.update_type === "replace" ? "=" : "+"}
                                    {stat.saves}S
                                  </Badge>
                                )}
                                {stat.partidos !== undefined && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    {stat.update_type === "replace" ? "=" : "+"}
                                    {stat.partidos}P
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                    <span className="text-purple-400 text-sm">IA procesando...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input - Mobile Optimized */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                placeholder={
                  canUpdateStats
                    ? "Ej: Llevo 10 goles en 15 partidos"
                    : canWriteInChat
                      ? "Escribe un mensaje..."
                      : "Selecciona tu perfil para escribir"
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
                disabled={!canWriteInChat || isSending}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !canWriteInChat || isSending}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {!canWriteInChat && (
              <p className="text-purple-400 text-xs mt-2 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Selecciona tu perfil arriba para escribir
              </p>
            )}

            {canWriteInChat && !canUpdateStats && (
              <p className="text-blue-400 text-xs mt-2">
                👥 Como visitante puedes escribir, pero solo los jugadores actualizan estadísticas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
