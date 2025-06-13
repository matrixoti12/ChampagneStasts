const DEEPSEEK_API_KEY = "sk-73929b315d6f4116aee9794517654cd2"

export interface PlayerStats {
  id: string
  name: string
  team: string
  position: "field" | "goalkeeper"
  goals: number
  assists: number
  saves: number
  mvp_count: number
  rating: number
  card_style: "glass" | "elite" | "fire" | "holographic" | "diamond" | "cosmic"
  photo: string
  league_logo_url: string
  team_logo_url: string
}

export async function generatePlayerStatsFromComments(comments: string[]): Promise<PlayerStats[]> {
  try {
    const prompt = `
Analiza los siguientes comentarios de un chat de fútbol y extrae las estadísticas de los jugadores mencionados. 
Genera un JSON con la información de cada jugador único mencionado.

Comentarios:
${comments.map((comment, index) => `${index + 1}. ${comment}`).join("\n")}

Instrucciones:
1. Identifica todos los jugadores mencionados
2. Suma las estadísticas si un jugador aparece múltiples veces
3. Si no se especifica un equipo, usa "Equipo Desconocido"
4. Para la posición: usa "goalkeeper" si se mencionan atajadas/saves, sino usa "field"
5. Para mvp_count usa 0 por defecto
6. Para rating usa un número del 1-5 basado en el rendimiento mencionado
7. Para card_style elige entre: "glass", "elite", "fire", "holographic", "diamond", "cosmic" basado en la calidad del jugador
8. Usa URLs de placeholder para photo, league_logo_url y team_logo_url

Responde ÚNICAMENTE con un JSON válido en este formato:
[
  {
    "id": "unique_id",
    "name": "Nombre del Jugador",
    "team": "Nombre del Equipo",
    "position": "field" | "goalkeeper",
    "goals": 0,
    "assists": 0,
    "saves": 0,
    "mvp_count": 0,
    "rating": 4,
    "card_style": "glass",
    "photo": "/placeholder.svg?height=144&width=144",
    "league_logo_url": "/placeholder.svg?height=48&width=48",
    "team_logo_url": "/placeholder.svg?height=48&width=48"
  }
]
`

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response")
    }

    const playersData = JSON.parse(jsonMatch[0])
    return playersData
  } catch (error) {
    console.error("Error generating player stats with AI:", error)
    throw error
  }
}

export async function analyzeCommentForStats(comment: string): Promise<string> {
  try {
    const prompt = `
Analiza este comentario de fútbol y extrae información relevante sobre estadísticas de jugadores:

Comentario: "${comment}"

Identifica:
- Nombre del jugador
- Goles anotados
- Asistencias
- Atajadas/saves
- Equipo mencionado
- Cualquier otra estadística relevante

Responde en formato de texto simple y claro, por ejemplo:
"Jugador: Messi, Goles: 2, Asistencias: 1, Equipo: Inter Miami"

Si no hay información clara de estadísticas, responde: "No se detectaron estadísticas específicas"
`

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error analyzing comment with AI:", error)
    return "Error al analizar el comentario"
  }
}
