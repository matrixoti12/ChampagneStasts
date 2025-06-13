export interface Player {
  id: string
  name: string
  team: string
  photo: string
  league_logo_url?: string
  team_logo_url?: string
  position: "delantero" | "defensa" | "medio" | "portero" | "polivalente"
  goals?: number
  assists?: number
  saves?: number
  partidos?: number
  mvp_count: number
  rating?: number // 1-5 stars
  card_style: "glass" | "elite" | "fire" | "holographic" | "diamond" | "cosmic"
}

export interface Vote {
  id: string
  player_id: string
  voter_name: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  wins: number
  draws: number
  losses: number
  points: number
}

export interface Match {
  id: string
  home_team: string
  away_team: string
  date: string
  time: string
}

export interface Standings {
  id: string
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export interface PlayerStatsUpdate {
  player_name: string
  goals?: number
  assists?: number
  saves?: number
  partidos?: number
  team?: string
  confidence: number
}

export interface AutoUpdateResult {
  success: boolean
  updated_players: string[]
  message: string
  stats_detected: PlayerStatsUpdate[]
}

// Nuevos tipos para el sistema de usuarios
export interface UserSession {
  name: string
  type: "player" | "visitor"
  player_id?: string
  can_update_stats: boolean
}

export interface Visitor {
  id: string
  name: string
  created_at: string
}
