const DEEPSEEK_API_KEY = "sk-73929b315d6f4116aee9794517654cd2"

export interface PlayerStatsUpdate {
  player_name: string
  goals?: number
  assists?: number
  saves?: number
  partidos?: number
  team?: string
  confidence: number
  update_type: "replace" | "increment" | "correct"
  context_type: "correction" | "addition" | "total_update" | "normal"
  reasoning?: string
}

export interface AutoUpdateResult {
  success: boolean
  updated_players: string[]
  message: string
  stats_detected: PlayerStatsUpdate[]
}

// Función mejorada para detectar contexto de conversación
function analyzeConversationContext(message: string): {
  isCorrection: boolean
  isAddition: boolean
  isTotalUpdate: boolean
  contextClues: string[]
} {
  const correctionPatterns = [
    /\b(en realidad|realmente|la verdad|en verdad|solo tengo|únicamente|nada más)\b/gi,
    /\b(me equivoqué|error|incorrecto|mal|corregir|rectificar)\b/gi,
    /\b(no tengo|no he|cero|0)\b/gi,
    /\b(cuando en realidad|pero en realidad|pero solo|pero realmente)\b/gi,
  ]

  const additionPatterns = [
    /\b(hice|anoté|marqué|di|conseguí|logré|hoy|ayer|recién)\b/gi,
    /\b(acabo de|acabé de|terminé de|en el partido|en el juego)\b/gi,
    /\b(sumé|agregué|más|adicional|nuevo|otra)\b/gi,
  ]

  const totalUpdatePatterns = [
    /\b(llevo|tengo|total|en total|acumulado|hasta ahora)\b/gi,
    /\b(mi total es|mis estadísticas son|en resumen)\b/gi,
  ]

  const contextClues: string[] = []
  let isCorrection = false
  let isAddition = false
  let isTotalUpdate = false

  // Detectar correcciones
  for (const pattern of correctionPatterns) {
    const matches = message.match(pattern)
    if (matches) {
      isCorrection = true
      contextClues.push(...matches)
    }
  }

  // Detectar adiciones
  for (const pattern of additionPatterns) {
    const matches = message.match(pattern)
    if (matches) {
      isAddition = true
      contextClues.push(...matches)
    }
  }

  // Detectar actualizaciones totales
  for (const pattern of totalUpdatePatterns) {
    const matches = message.match(pattern)
    if (matches) {
      isTotalUpdate = true
      contextClues.push(...matches)
    }
  }

  return { isCorrection, isAddition, isTotalUpdate, contextClues }
}

// Función mejorada para extraer estadísticas con contexto
function extractStatsWithContext(message: string, userName: string): PlayerStatsUpdate[] {
  const stats: PlayerStatsUpdate[] = []

  try {
    console.log("🧠 Analyzing message with context:", message)

    const context = analyzeConversationContext(message)
    console.log("📝 Context analysis:", context)

    // Determinar el tipo de actualización basado en el contexto
    let updateType: "replace" | "increment" | "correct" = "increment"
    let contextType: "correction" | "addition" | "total_update" | "normal" = "normal"

    if (context.isCorrection) {
      updateType = "correct"
      contextType = "correction"
    } else if (context.isTotalUpdate) {
      updateType = "replace"
      contextType = "total_update"
    } else if (context.isAddition) {
      updateType = "increment"
      contextType = "addition"
    }

    // Patrones mejorados para extraer números con contexto
    const enhancedPatterns = {
      goals: [/(\d+)\s*gol[es]*/gi, /\b(cero|0)\s*gol[es]*/gi, /\b(ningún|ningun)\s*gol/gi, /\b(no.*gol|sin.*gol)/gi],
      assists: [
        /(\d+)\s*(asist[encias]*|pases?)/gi,
        /\b(cero|0)\s*(asist[encias]*|pases?)/gi,
        /\b(ninguna|ningún)\s*(asist[encia]*|pase)/gi,
        /\b(no.*asist|sin.*asist)/gi,
      ],
      saves: [
        /(\d+)\s*(atajadas?|saves?|paradas?)/gi,
        /\b(cero|0)\s*(atajadas?|saves?)/gi,
        /\b(ninguna)\s*(atajada|save)/gi,
        /\b(no.*ataj|sin.*ataj)/gi,
      ],
      partidos: [/(\d+)\s*(partidos?|juegos?|matches?)/gi, /\ben\s*(\d+)\s*partidos?/gi],
    }

    const extractedStats: any = {
      player_name: userName,
      confidence: 0.9,
      update_type: updateType,
      context_type: contextType,
      reasoning: `Detected ${contextType} context with clues: ${context.contextClues.join(", ")}`,
    }

    let hasStats = false

    // Extraer cada tipo de estadística con manejo de ceros y negaciones
    for (const [statType, patterns] of Object.entries(enhancedPatterns)) {
      for (const pattern of patterns) {
        const matches = message.match(pattern)
        if (matches && matches.length > 0) {
          // Manejar casos especiales
          const matchText = matches[0].toLowerCase()

          if (matchText.includes("cero") || matchText.includes("ningún") || matchText.includes("ninguna")) {
            extractedStats[statType] = 0
            hasStats = true
            console.log(`🔍 Found zero/none for ${statType}:`, matchText)
          } else if (matchText.includes("no ") || matchText.includes("sin ")) {
            extractedStats[statType] = 0
            hasStats = true
            console.log(`🔍 Found negation for ${statType}:`, matchText)
          } else {
            // Extraer número normal
            const numberMatch = matches[0].match(/\d+/)
            if (numberMatch) {
              const value = Number.parseInt(numberMatch[0])
              if (!isNaN(value) && value >= 0) {
                extractedStats[statType] = value
                hasStats = true
                console.log(`🔍 Found number for ${statType}:`, value)
              }
            }
          }
          break // Solo tomar el primer match por tipo
        }
      }
    }

    if (hasStats) {
      stats.push(extractedStats)
      console.log("✅ Enhanced extraction result:", extractedStats)
    }
  } catch (error) {
    console.error("❌ Error in enhanced extraction:", error)
  }

  return stats
}

export async function analyzeMessageForAutoUpdate(message: string, userName: string): Promise<PlayerStatsUpdate[]> {
  try {
    console.log("🚀 Starting intelligent analysis for:", message)

    // Primero usar extracción mejorada con contexto
    const contextualStats = extractStatsWithContext(message, userName)

    if (contextualStats.length > 0) {
      console.log("✅ Using contextual extraction result")
      return contextualStats
    }

    // Si no hay resultados claros, usar IA con prompt mejorado
    const prompt = `
Eres un asistente experto en fútbol que entiende conversaciones humanas naturales. Analiza este mensaje y extrae estadísticas.

MENSAJE: "${message}"
USUARIO: "${userName}"

CONTEXTO IMPORTANTE:
- Si el usuario dice "en realidad", "solo tengo", "realmente", está CORRIGIENDO datos existentes
- Si dice "hice", "anoté", "marqué", está AGREGANDO nuevos datos
- Si dice "llevo", "tengo", "total", está dando el TOTAL acumulado
- Si menciona "cero", "ningún", "no tengo", el valor es 0
- Si dice "me equivoqué" o "error", está corrigiendo

EJEMPLOS:
- "veo que tengo 7 goles pero en realidad solo tengo 1 asistencia" → CORRECCIÓN: 0 goles, 1 asistencia
- "hice 2 goles hoy" → INCREMENTO: +2 goles
- "llevo 5 goles en total" → REEMPLAZO: 5 goles total
- "no tengo ningún gol" → CORRECCIÓN: 0 goles

TIPOS DE ACTUALIZACIÓN:
- "correct" = está corrigiendo datos incorrectos
- "increment" = está agregando nuevos datos
- "replace" = está dando totales acumulados

FORMATO DE RESPUESTA (solo JSON válido):
[{
  "player_name": "${userName}",
  "goals": 0,
  "assists": 1,
  "confidence": 0.95,
  "update_type": "correct",
  "context_type": "correction",
  "reasoning": "Usuario corrigiendo datos: dice 'en realidad solo tengo'"
}]

Si no hay estadísticas claras: []
`

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Más determinístico para mejor precisión
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      console.error(`❌ DeepSeek API error: ${response.status}`)
      return contextualStats
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content?.trim() || ""

    console.log("🤖 AI Response:", aiResponse)

    // Extraer JSON de la respuesta de IA
    const aiStats = extractJSONFromResponse(aiResponse)

    // Validar y filtrar resultados de IA
    const validAiStats = aiStats.filter((stat: any) => {
      return (
        stat &&
        typeof stat === "object" &&
        stat.player_name &&
        typeof stat.confidence === "number" &&
        stat.confidence >= 0.8 &&
        (stat.goals !== undefined ||
          stat.assists !== undefined ||
          stat.saves !== undefined ||
          stat.partidos !== undefined)
      )
    })

    if (validAiStats.length > 0) {
      console.log("✅ Using enhanced AI extraction result:", validAiStats)
      return validAiStats
    }

    console.log("ℹ️ No clear stats detected")
    return []
  } catch (error) {
    console.error("❌ Error in enhanced analysis:", error)
    return contextualStats
  }
}

// Función mejorada para extraer JSON de manera robusta
function extractJSONFromResponse(response: string): any[] {
  try {
    const cleaned = response.trim()
    console.log("📄 Original response:", response)

    // Buscar patrones de JSON
    const patterns = [
      /\[[\s\S]*?\]/g, // Array completo
      /\{[\s\S]*?\}/g, // Objeto individual
    ]

    for (const pattern of patterns) {
      const matches = cleaned.match(pattern)
      if (matches) {
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match)
            console.log("✅ Successfully parsed:", parsed)
            return Array.isArray(parsed) ? parsed : [parsed]
          } catch (e) {
            console.log("❌ Failed to parse match:", match)
            continue
          }
        }
      }
    }

    return []
  } catch (error) {
    console.error("❌ Error extracting JSON:", error)
    return []
  }
}

export async function generateSmartResponse(
  message: string,
  userName: string,
  statsDetected: PlayerStatsUpdate[],
): Promise<string> {
  try {
    if (statsDetected.length === 0) {
      // Verificar si el mensaje parece contener estadísticas pero no se detectaron
      const hasNumbers = /\d+/.test(message)
      const hasSportsTerms = /(gol|asist|atajada|partido|save)/i.test(message)

      if (hasNumbers && hasSportsTerms) {
        return "🤔 Detecté números y términos deportivos, pero no pude extraer estadísticas claras. Intenta con frases como: 'En realidad solo tengo 2 goles' o 'Hice 1 gol hoy'"
      }

      return "💬 Mensaje recibido. Para actualizar estadísticas, usa frases naturales como 'Llevo 5 goles en 10 partidos' o 'En realidad solo tengo 1 asistencia'"
    }

    const stat = statsDetected[0]
    const parts = []
    if (stat.goals !== undefined) parts.push(`${stat.goals} goles`)
    if (stat.assists !== undefined) parts.push(`${stat.assists} asistencias`)
    if (stat.saves !== undefined) parts.push(`${stat.saves} atajadas`)
    if (stat.partidos !== undefined) parts.push(`${stat.partidos} partidos`)

    let actionText = ""
    let emoji = ""

    switch (stat.context_type) {
      case "correction":
        actionText = "corrigiendo a"
        emoji = "🔧"
        break
      case "addition":
        actionText = "sumando"
        emoji = "➕"
        break
      case "total_update":
        actionText = "actualizando total a"
        emoji = "📊"
        break
      default:
        actionText = "actualizando a"
        emoji = "🔄"
    }

    return `${emoji} ¡Entendido! ${stat.player_name}: ${actionText} ${parts.join(", ")} - ${stat.reasoning || "Procesando..."}`
  } catch (error) {
    console.error("❌ Error generating smart response:", error)
    return "🤖 Estadísticas procesadas inteligentemente"
  }
}

export async function updatePlayerStatsInDatabase(
  statsUpdates: PlayerStatsUpdate[],
  supabase: any,
): Promise<AutoUpdateResult> {
  const updatedPlayers: string[] = []
  const errors: string[] = []

  console.log("🚀 Starting database update with:", statsUpdates)

  try {
    for (const update of statsUpdates) {
      try {
        console.log("🔍 Processing update for:", update.player_name)

        const { data: existingPlayers, error: searchError } = await supabase
          .from("players")
          .select("*")
          .ilike("name", `%${update.player_name}%`)

        if (searchError) {
          console.error("❌ Search error:", searchError)
          throw searchError
        }

        console.log("📊 Found players:", existingPlayers?.length || 0)

        if (existingPlayers && existingPlayers.length > 0) {
          const targetPlayer = existingPlayers[0]
          console.log("🎯 Target player current stats:", {
            goals: targetPlayer.goals,
            assists: targetPlayer.assists,
            saves: targetPlayer.saves,
            partidos: targetPlayer.partidos,
          })

          const updatedStats: any = {}

          // Manejar diferentes tipos de actualización con logging
          console.log("🔄 Update type:", update.update_type, "Context:", update.context_type)

          switch (update.update_type) {
            case "correct":
            case "replace":
              console.log("🔧 Applying REPLACE/CORRECT logic")
              if (update.goals !== undefined) {
                updatedStats.goals = update.goals
                console.log(`  Goals: ${targetPlayer.goals} → ${update.goals}`)
              }
              if (update.assists !== undefined) {
                updatedStats.assists = update.assists
                console.log(`  Assists: ${targetPlayer.assists} → ${update.assists}`)
              }
              if (update.saves !== undefined) {
                updatedStats.saves = update.saves
                console.log(`  Saves: ${targetPlayer.saves} → ${update.saves}`)
              }
              if (update.partidos !== undefined) {
                updatedStats.partidos = update.partidos
                console.log(`  Partidos: ${targetPlayer.partidos} → ${update.partidos}`)
              }
              break

            case "increment":
              console.log("➕ Applying INCREMENT logic")
              if (update.goals !== undefined) {
                const newGoals = (targetPlayer.goals || 0) + update.goals
                updatedStats.goals = newGoals
                console.log(`  Goals: ${targetPlayer.goals} + ${update.goals} = ${newGoals}`)
              }
              if (update.assists !== undefined) {
                const newAssists = (targetPlayer.assists || 0) + update.assists
                updatedStats.assists = newAssists
                console.log(`  Assists: ${targetPlayer.assists} + ${update.assists} = ${newAssists}`)
              }
              if (update.saves !== undefined) {
                const newSaves = (targetPlayer.saves || 0) + update.saves
                updatedStats.saves = newSaves
                console.log(`  Saves: ${targetPlayer.saves} + ${update.saves} = ${newSaves}`)
              }
              if (update.partidos !== undefined) {
                const newPartidos = (targetPlayer.partidos || 0) + update.partidos
                updatedStats.partidos = newPartidos
                console.log(`  Partidos: ${targetPlayer.partidos} + ${update.partidos} = ${newPartidos}`)
              }
              break

            default:
              console.log("⚠️ Unknown update type, defaulting to replace")
              if (update.goals !== undefined) updatedStats.goals = update.goals
              if (update.assists !== undefined) updatedStats.assists = update.assists
              if (update.saves !== undefined) updatedStats.saves = update.saves
              if (update.partidos !== undefined) updatedStats.partidos = update.partidos
          }

          console.log("📝 Final update object:", updatedStats)

          if (Object.keys(updatedStats).length > 0) {
            console.log("💾 Executing database update...")

            const { data: updateResult, error: updateError } = await supabase
              .from("players")
              .update(updatedStats)
              .eq("id", targetPlayer.id)
              .select()

            if (updateError) {
              console.error("❌ Update error:", updateError)
              throw updateError
            }

            console.log("✅ Database update successful:", updateResult)
            updatedPlayers.push(update.player_name)
          } else {
            console.log("⚠️ No stats to update")
          }
        } else {
          console.log("👤 Player not found, creating new player...")
          // Crear nuevo jugador si no existe
          const newPlayer = {
            name: update.player_name,
            team: update.team || "Equipo Desconocido",
            position: "delantero",
            goals: update.goals || 0,
            assists: update.assists || 0,
            saves: update.saves || 0,
            partidos: update.partidos || 0,
            mvp_count: 0,
            rating: 3,
            card_style: "glass",
            photo: "/placeholder.svg?height=144&width=144",
            league_logo_url: "/placeholder.svg?height=48&width=48",
            team_logo_url: "/placeholder.svg?height=48&width=48",
          }

          const { data: createdPlayer, error: createError } = await supabase
            .from("players")
            .insert(newPlayer)
            .select()
            .single()

          if (createError) {
            console.error("❌ Create error:", createError)
            throw createError
          }

          console.log("✅ New player created:", createdPlayer)
          updatedPlayers.push(update.player_name)
        }
      } catch (playerError) {
        console.error(`❌ Error updating player ${update.player_name}:`, playerError)
        errors.push(`Error actualizando ${update.player_name}: ${playerError.message}`)
      }
    }

    const update = statsUpdates[0]
    let actionText = ""

    switch (update?.context_type) {
      case "correction":
        actionText = "corregidas"
        break
      case "addition":
        actionText = "incrementadas"
        break
      case "total_update":
        actionText = "actualizadas (total)"
        break
      default:
        actionText = "actualizadas"
    }

    const finalResult = {
      success: updatedPlayers.length > 0,
      updated_players: updatedPlayers,
      message:
        updatedPlayers.length > 0
          ? `✅ Estadísticas ${actionText} para: ${updatedPlayers.join(", ")}`
          : `❌ No se pudieron actualizar: ${errors.join(", ")}`,
      stats_detected: statsUpdates,
    }

    console.log("🏁 Final result:", finalResult)
    return finalResult
  } catch (error) {
    console.error("❌ Error in updatePlayerStatsInDatabase:", error)
    return {
      success: false,
      updated_players: [],
      message: `❌ Error al actualizar la base de datos: ${error.message}`,
      stats_detected: statsUpdates,
    }
  }
}

export async function performAutoCleanup(supabase: any): Promise<boolean> {
  try {
    const { data: lastCleanup } = await supabase
      .from("auto_cleanups")
      .select("*")
      .order("cleanup_date", { ascending: false })
      .limit(1)

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const shouldCleanup =
      !lastCleanup || lastCleanup.length === 0 || new Date(lastCleanup[0].cleanup_date) < twoWeeksAgo

    if (!shouldCleanup) {
      return false
    }

    const { data: oldComments } = await supabase
      .from("comments")
      .select("id")
      .lt("created_at", twoWeeksAgo.toISOString())

    const commentsToDelete = oldComments?.length || 0

    if (commentsToDelete > 0) {
      await supabase.from("comments").delete().lt("created_at", twoWeeksAgo.toISOString())

      await supabase.from("auto_cleanups").insert({
        comments_deleted: commentsToDelete,
      })

      await supabase.from("comments").insert({
        user_name: "🤖 Sistema",
        message: `Chat limpiado automáticamente. Se eliminaron ${commentsToDelete} comentarios antiguos (más de 2 semanas).`,
        is_processed: true,
      })

      console.log(`🧹 Auto-cleanup completed: ${commentsToDelete} comments deleted`)
      return true
    }

    return false
  } catch (error) {
    console.error("❌ Error in auto-cleanup:", error)
    return false
  }
}
