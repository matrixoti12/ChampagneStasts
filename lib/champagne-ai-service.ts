const DEEPSEEK_API_KEY = "sk-73929b315d6f4116aee9794517654cd2"

export interface PlayerAnalysis {
  player_name: string
  performance_rating: number // 1-10
  strengths: string[]
  weaknesses: string[]
  comparison_text: string
  recommendation: string
  trend: "improving" | "declining" | "stable"
}

export interface TeamAnalysis {
  team_name: string
  offensive_power: number // 1-10
  creative_power: number // 1-10
  efficiency: number // 1-10
  balance_score: number // 1-10
  key_players: string[]
  team_style: string
  recommendation: string
}

export interface ChampagneInsights {
  top_performer: PlayerAnalysis
  most_improved: PlayerAnalysis
  team_analyses: TeamAnalysis[]
  league_summary: string
  predictions: string[]
  fun_facts: string[]
}

export async function generateChampagneInsights(players: any[]): Promise<ChampagneInsights> {
  try {
    // Preparar datos para la IA
    const playersData = players.map((p) => ({
      name: p.name,
      team: p.team,
      position: p.position,
      goals: p.goals || 0,
      assists: p.assists || 0,
      saves: p.saves || 0,
      partidos: p.partidos || 0,
      mvp_count: p.mvp_count || 0,
      rating: p.rating || 3,
      card_style: p.card_style,
    }))

    const prompt = `
Eres un analista experto de fútbol de la "Champagne League". Analiza estos datos de jugadores y genera insights profundos y entretenidos.

DATOS DE JUGADORES:
${JSON.stringify(playersData, null, 2)}

GENERA UN ANÁLISIS COMPLETO EN FORMATO JSON:

{
  "top_performer": {
    "player_name": "nombre",
    "performance_rating": 9.5,
    "strengths": ["Finalización letal", "Consistencia"],
    "weaknesses": ["Podría crear más jugadas"],
    "comparison_text": "Comparación con estrellas mundiales",
    "recommendation": "Recomendación para mejorar",
    "trend": "improving"
  },
  "most_improved": {
    "player_name": "nombre",
    "performance_rating": 8.0,
    "strengths": ["Mejora notable"],
    "weaknesses": ["Áreas a trabajar"],
    "comparison_text": "Su evolución",
    "recommendation": "Siguiente paso",
    "trend": "improving"
  },
  "team_analyses": [
    {
      "team_name": "Equipo",
      "offensive_power": 8.5,
      "creative_power": 7.0,
      "efficiency": 9.0,
      "balance_score": 8.0,
      "key_players": ["Jugador1", "Jugador2"],
      "team_style": "Descripción del estilo",
      "recommendation": "Cómo mejorar"
    }
  ],
  "league_summary": "Resumen general de la liga con estadísticas clave",
  "predictions": [
    "Predicción 1 sobre futuros partidos",
    "Predicción 2 sobre rendimientos"
  ],
  "fun_facts": [
    "Dato curioso 1",
    "Dato curioso 2",
    "Dato curioso 3"
  ]
}

INSTRUCCIONES:
1. Analiza rendimiento basado en goles, asistencias, partidos, MVP
2. Considera la posición del jugador (porteros vs jugadores de campo)
3. Calcula ratios como goles/partido, asistencias/partido
4. Identifica patrones y tendencias
5. Genera comparaciones interesantes
6. Incluye datos curiosos y predicciones
7. Usa un tono profesional pero entretenido
8. Considera el card_style como indicador de calidad

Responde ÚNICAMENTE con el JSON válido.
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
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Extraer JSON del response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response")
    }

    const insights = JSON.parse(jsonMatch[0])
    return insights
  } catch (error) {
    console.error("Error generating Champagne insights:", error)

    // Fallback con datos mock si falla la IA
    return {
      top_performer: {
        player_name: players[0]?.name || "Jugador Destacado",
        performance_rating: 9.0,
        strengths: ["Excelente rendimiento", "Consistencia notable"],
        weaknesses: ["Siempre hay margen de mejora"],
        comparison_text: "Rendimiento excepcional en la liga",
        recommendation: "Mantener el nivel y seguir mejorando",
        trend: "improving",
      },
      most_improved: {
        player_name: players[1]?.name || "Jugador en Ascenso",
        performance_rating: 7.5,
        strengths: ["Mejora constante", "Dedicación"],
        weaknesses: ["Necesita más experiencia"],
        comparison_text: "Evolución positiva",
        recommendation: "Continuar con el trabajo duro",
        trend: "improving",
      },
      team_analyses: [
        {
          team_name: "Equipo Destacado",
          offensive_power: 8.0,
          creative_power: 7.5,
          efficiency: 8.5,
          balance_score: 8.0,
          key_players: [players[0]?.name || "Jugador 1"],
          team_style: "Estilo ofensivo y dinámico",
          recommendation: "Mantener la intensidad",
        },
      ],
      league_summary: "La Champagne League muestra un nivel competitivo excepcional con jugadores de gran calidad.",
      predictions: ["Se espera una temporada muy competitiva", "Los goleadores seguirán destacando"],
      fun_facts: [
        "La liga tiene un promedio de goles muy alto",
        "Los jugadores muestran gran versatilidad",
        "El nivel técnico es excepcional",
      ],
    }
  }
}

export async function generatePlayerComparison(player1: any, player2: any): Promise<string> {
  try {
    const prompt = `
Compara estos dos jugadores de fútbol y genera un análisis detallado:

JUGADOR 1: ${JSON.stringify(player1)}
JUGADOR 2: ${JSON.stringify(player2)}

Genera una comparación detallada que incluya:
1. Estadísticas clave
2. Fortalezas de cada uno
3. Estilo de juego
4. Quién es mejor en qué aspectos
5. Conclusión sobre quién tiene mejor rendimiento general

Responde en español con un análisis profesional pero entretenido.
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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating player comparison:", error)
    return `Comparación entre ${player1.name} y ${player2.name}: Ambos jugadores muestran un rendimiento excepcional en sus respectivas posiciones.`
  }
}
