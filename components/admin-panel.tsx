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
  const [matchSchedule, setMatchSchedule] = useState("")
  const [teamStandings, setTeamStandings] = useState("")
  const [isUploading, setIsUploading] = useState(false)

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
      const teams = JSON.parse(teamStandings)

      // Limpiar tabla teams existente
      await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      // Insertar nuevos datos
      for (const team of teams) {
        await supabase.from("teams").insert({
          name: team.name,
          wins: parseInt(team.wins) || 0,
          draws: parseInt(team.draws) || 0,
          losses: parseInt(team.losses) || 0,
          points: parseInt(team.points) || 0
        })
      }

      // Guardar registro de la actualización
      await supabase.from("json_uploads").insert({
        type: "team_standings",
        data: teams,
        uploaded_by: "German Rauda"
      })

      alert("Team standings uploaded successfully!")
      setTeamStandings("")
    } catch (error) {
      alert("Error uploading team standings: " + error)
      console.error("Upload error details:", error)
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
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Match Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Team Standings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Match Schedule JSON (Display Only)</label>
                <Textarea
                  value={matchSchedule}
                  onChange={(e) => setMatchSchedule(e.target.value)}
                  placeholder={`[
  {
    "id": "1",
    "home_team": "Champagne",
    "away_team": "New Gen",
    "date": "2024-01-20",
    "time": "20:00"
  },
  {
    "id": "2",
    "home_team": "Baigon",
    "away_team": "Man.City",
    "date": "2024-01-20",
    "time": "21:30"
  },
  {
    "id": "3",
    "home_team": "Colon",
    "away_team": "Santos",
    "date": "2024-01-21",
    "time": "20:00"
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
                  placeholder={`// Ejemplo de JSON para actualizar equipos:
[
  {
    "name": "Baigon",       // Campo obligatorio, debe ser único
    "wins": 3,             // Opcional, default: 0
    "draws": 1,            // Opcional, default: 0
    "losses": 2,           // Opcional, default: 0
    "points": 10           // Opcional, default: 0
  },
  {
    "name": "New Gen",
    "wins": 5,
    "draws": 0,
    "losses": 1,
    "points": 15
  }
  // Puedes agregar más equipos siguiendo el mismo formato
]

// Nota: Los campos id y created_at son manejados automáticamente por la base de datos`}
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
