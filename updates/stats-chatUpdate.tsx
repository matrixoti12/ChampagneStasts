"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { generatePlayerStatsFromComments, analyzeCommentForStats } from "@/lib/ai-service"
import { MessageCircle, Send, Trash2, Sparkles, Brain } from "lucide-react"

interface Comment {
  id: string
  user_name: string
  message: string
  is_processed: boolean
  created_at: string
}

interface StatsChatProps {
  userName: string
}

export default function StatsChat({ userName }: StatsChatProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingJson, setIsGeneratingJson] = useState(false)
  const [generatedJson, setGeneratedJson] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComments()
    // Set up real-time subscription
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

  const loadComments = async () => {
    setIsLoading(true)
    try {
      if (!hasValidCredentials) {
        // Mock data for demo
        const mockComments: Comment[] = [
          {
            id: "1",
            user_name: "Carlos",
            message: "Tacua hizo 2 goles y 1 asistencia hoy contra Alajuelense, jugó increíble",
            is_processed: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            user_name: "María",
            message: "Keylor Navas tuvo 8 atajadas increíbles en el partido de PSG",
            is_processed: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            user_name: "Luis",
            message: "Messi anotó un hat-trick (3 goles) y dio 2 asistencias para Inter Miami",
            is_processed: false,
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

  const analyzeCommentWithAI = async (commentId: string, message: string) => {
    try {
      const analysis = await analyzeCommentForStats(message)
      setAiAnalysis((prev) => ({ ...prev, [commentId]: analysis }))
    } catch (error) {
      console.error("Error analyzing comment:", error)
      setAiAnalysis((prev) => ({ ...prev, [commentId]: "Error al analizar" }))
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userName) return

    setIsSending(true)
    try {
      const commentData = {
        user_name: userName,
        message: newMessage.trim(),
        is_processed: false,
      }

      if (!hasValidCredentials) {
        // Demo mode - just add to local state
        const newComment: Comment = {
          id: Date.now().toString(),
          ...commentData,
          created_at: new Date().toISOString(),
        }
        setComments((prev) => [...prev, newComment])

        // Analyze with AI in demo mode
        analyzeCommentWithAI(newComment.id, newComment.message)

        setNewMessage("")
        setIsSending(false)
        return
      }

      const { data, error } = await supabase.from("comments").insert(commentData).select().single()

      if (error) throw error

      // Analyze the new comment with AI
      if (data) {
        analyzeCommentWithAI(data.id, data.message)
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar mensaje")
    }
    setIsSending(false)
  }

  const generateJsonWithAI = async () => {
    setIsGeneratingJson(true)
    try {
      const unprocessedComments = comments.filter((comment) => !comment.is_processed).map((comment) => comment.message)

      if (unprocessedComments.length === 0) {
        alert("No hay comentarios sin procesar")
        setIsGeneratingJson(false)
        return
      }

      const playersData = await generatePlayerStatsFromComments(unprocessedComments)
      setGeneratedJson(JSON.stringify(playersData, null, 2))

      alert("¡JSON generado exitosamente con IA!")
    } catch (error) {
      console.error("Error generating JSON with AI:", error)
      alert("Error al generar JSON con IA: " + error.message)
    }
    setIsGeneratingJson(false)
  }

  const markCommentsAsProcessed = async () => {
    if (!hasValidCredentials) {
      // In demo mode, just mark locally
      setComments((prev) =>
        prev.map((comment) => (!comment.is_processed ? { ...comment, is_processed: true } : comment)),
      )
      alert("Comentarios marcados como procesados (modo demo)")
      return
    }

    try {
      const unprocessedIds = comments.filter((c) => !c.is_processed).map((c) => c.id)

      if (unprocessedIds.length === 0) return

      const { error } = await supabase.from("comments").update({ is_processed: true }).in("id", unprocessedIds)

      if (error) throw error

      loadComments()
      alert("Comentarios marcados como procesados")
    } catch (error) {
      console.error("Error marking comments as processed:", error)
    }
  }

  const clearChat = async () => {
    if (!confirm("¿Estás seguro de que quieres limpiar todo el chat?")) return

    if (!hasValidCredentials) {
      setComments([])
      setAiAnalysis({})
      return
    }

    try {
      const { error } = await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) throw error

      setComments([])
      setAiAnalysis({})
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

  return (
    <div className="space-y-6">
      {/* Chat Messages */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-amber-400" />
              <span>Chat de Estadísticas con IA</span>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={generateJsonWithAI}
                disabled={isGeneratingJson}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isGeneratingJson ? "Generando..." : "Generar con IA"}
              </Button>
              {userName === "German Rauda" && (
                <Button onClick={clearChat} size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-3 mb-4 p-4 bg-black/20 rounded-lg">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.user_name === userName ? "bg-amber-500/20 ml-8" : "bg-white/10 mr-8"
                    } ${comment.is_processed ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-amber-400">{comment.user_name}</span>
                      <div className="flex items-center space-x-2">
                        {comment.is_processed && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                            Procesado
                          </Badge>
                        )}
                        <span className="text-xs text-white/60">{formatTime(comment.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-white mb-2">{comment.message}</p>

                    {/* AI Analysis */}
                    {aiAnalysis[comment.id] && (
                      <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-purple-300 font-medium">Análisis IA:</span>
                        </div>
                        <p className="text-sm text-purple-200">{aiAnalysis[comment.id]}</p>
                      </div>
                    )}

                    {/* Analyze button */}
                    {!aiAnalysis[comment.id] && (
                      <Button
                        onClick={() => analyzeCommentWithAI(comment.id, comment.message)}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Analizar con IA
                      </Button>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ej: Tacua hizo 2 goles y 1 asistencia contra Alajuelense"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="bg-white/10 border-white/20 text-white placeholder-white/60"
              disabled={!userName}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !userName || isSending}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {!userName && <p className="text-amber-400 text-sm mt-2">Ingresa tu nombre arriba para poder comentar</p>}
        </CardContent>
      </Card>

      {/* Generated JSON */}
      {generatedJson && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>JSON Generado por IA</span>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedJson)}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Copiar
                </Button>
                {userName === "German Rauda" && (
                  <Button onClick={markCommentsAsProcessed} size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Marcar como Procesado
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedJson}
              readOnly
              rows={15}
              className="font-mono text-sm bg-black/30 border-white/20 text-green-400"
            />
            <p className="text-white/70 text-sm mt-2">
              <Brain className="w-4 h-4 inline mr-1" />
              JSON generado automáticamente por IA. Copia este código y úsalo en el panel de administración para
              actualizar las estadísticas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
