"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { Upload, FileText, Calendar, Trophy } from "lucide-react"

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [playerStats, setPlayerStats] = useState("")
  const [matchSchedule, setMatchSchedule] = useState("")
  const [teamStandings, setTeamStandings] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const uploadPlayerStats = async () => {
    if (!hasValidCredentials) {
      alert("Supabase configuration required for admin functionality")
      return
    }

    setIsUploading(true)
    try {
      const stats = JSON.parse(playerStats)

      // Update players table
      for (const player of stats) {
        await supabase.from("players").upsert(player)
      }

      // Store JSON upload record
      await supabase.from("json_uploads").insert({
        type: "player_stats",
        data: stats,
        uploaded_by: "German Rauda",
      })

      alert("Player stats uploaded successfully!")
      setPlayerStats("")
    } catch (error) {
      alert("Error uploading player stats: " + error)
    }
    setIsUploading(false)
  }

  const uploadMatchSchedule = async () => {
    if (!hasValidCredentials) {
      alert("Supabase configuration required for admin functionality")
      return
    }

    setIsUploading(true)
    try {
      const schedule = JSON.parse(matchSchedule)

      await supabase.from("json_uploads").insert({
        type: "match_schedule",
        data: schedule,
        uploaded_by: "German Rauda",
      })

      alert("Match schedule uploaded successfully!")
      setMatchSchedule("")
    } catch (error) {
      alert("Error uploading match schedule: " + error)
    }
    setIsUploading(false)
  }

  const uploadTeamStandings = async () => {
    if (!hasValidCredentials) {
      alert("Supabase configuration required for admin functionality")
      return
    }

    setIsUploading(true)
    try {
      const standings = JSON.parse(teamStandings)

      // Update standings table
      for (const team of standings) {
        await supabase.from("standings").upsert(team)
      }

      await supabase.from("json_uploads").insert({
        type: "team_standings",
        data: standings,
        uploaded_by: "German Rauda",
      })

      alert("Team standings uploaded successfully!")
      setTeamStandings("")
    } catch (error) {
      alert("Error uploading team standings: " + error)
    }
    setIsUploading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-6 h-6" />
              <span>Admin Panel</span>
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="players" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Player Stats</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Match Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Team Standings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Player Stats JSON</label>
                <Textarea
                  value={playerStats}
                  onChange={(e) => setPlayerStats(e.target.value)}
                  placeholder={`[
  {
    "id": "1",
    "name": "Player Name",
    "team": "Team Name",
    "position": "field",
    "goals": 10,
    "assists": 5,
    "mvp_count": 2,
    "rating": 4,
    "card_style": "elite",
    "photo": "/placeholder.svg?height=144&width=144",
    "league_logo_url": "/placeholder.svg?height=48&width=48",
    "team_logo_url": "/placeholder.svg?height=48&width=48"
  }
]`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={uploadPlayerStats} disabled={isUploading || !playerStats} className="w-full">
                {isUploading ? "Uploading..." : "Upload Player Stats"}
              </Button>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Match Schedule JSON (Display Only)</label>
                <Textarea
                  value={matchSchedule}
                  onChange={(e) => setMatchSchedule(e.target.value)}
                  placeholder={`[
  {
    "id": "1",
    "home_team": "Team A",
    "away_team": "Team B",
    "date": "2024-06-15",
    "time": "15:00",
    "home_logo": "/placeholder.svg?height=48&width=48",
    "away_logo": "/placeholder.svg?height=48&width=48"
  }
]`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={uploadMatchSchedule} disabled={isUploading || !matchSchedule} className="w-full">
                {isUploading ? "Uploading..." : "Upload Match Schedule"}
              </Button>
            </TabsContent>

            <TabsContent value="standings" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team Standings JSON</label>
                <Textarea
                  value={teamStandings}
                  onChange={(e) => setTeamStandings(e.target.value)}
                  placeholder={`[
  {
    "id": "1",
    "team_name": "Team Name",
    "played": 10,
    "won": 7,
    "drawn": 2,
    "lost": 1,
    "goals_for": 20,
    "goals_against": 8,
    "goal_difference": 12,
    "points": 23
  }
]`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={uploadTeamStandings} disabled={isUploading || !teamStandings} className="w-full">
                {isUploading ? "Uploading..." : "Upload Team Standings"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
