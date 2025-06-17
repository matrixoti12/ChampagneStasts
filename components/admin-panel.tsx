"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { Upload, FileText, Calendar, Trophy } from "lucide-react"

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  date: string;
  time: string;
}

interface MatchSchedule {
  matches?: Match[];
}

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [matchSchedule, setMatchSchedule] = useState("")
  const [teamStandings, setTeamStandings] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const validateMatchSchedule = (schedule: Match[]): boolean => {
    if (!Array.isArray(schedule)) {
      alert("El JSON debe ser un array de partidos")
      return false
    }

    const currentYear = new Date().getFullYear()
    for (const match of schedule) {
      if (!match.id || !match.home_team || !match.away_team || !match.date || !match.time) {
        alert("Cada partido debe tener: id, home_team, away_team, date y time")
        return false
      }

      // Validar formato de fecha (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(match.date)) {
        alert(`Formato de fecha inválido: ${match.date}. Debe ser YYYY-MM-DD`)
        return false
      }

      // Validar año
      const year = parseInt(match.date.split('-')[0])
      if (year < currentYear) {
        alert(`Año inválido en fecha: ${match.date}. Debe ser ${currentYear} o posterior`)
        return false
      }

      // Validar formato de hora (HH:MM)
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(match.time)) {
        alert(`Formato de hora inválido: ${match.time}. Debe ser HH:MM (24 horas)`)
        return false
      }

      // Validar equipos
      if (!/^[A-Za-z0-9\s.]+$/.test(match.home_team) || !/^[A-Za-z0-9\s.]+$/.test(match.away_team)) {
        alert(`Nombres de equipo inválidos: "${match.home_team}" vs "${match.away_team}"`)
        return false
      }
    }

    return true
  }

  const uploadMatchSchedule = async () => {
    if (!hasValidCredentials) {
      alert("Supabase configuration required for admin functionality")
      return
    }

    setIsUploading(true)
    try {
      console.log("Parsing JSON data...");
      let schedule = JSON.parse(matchSchedule)
      
      // Si los datos vienen envueltos en un objeto "matches", usar ese array
      if (schedule.matches && Array.isArray(schedule.matches)) {
        schedule = schedule.matches
      }

      // Validar y corregir las fechas si es necesario
      schedule = schedule.map((match: Match) => {
        // Asegurarse de que la fecha use el año correcto (2025)
        if (match.date && match.date.startsWith('2024-')) {
          match.date = '2025-' + match.date.slice(5)
        }
        return match
      })
      
      console.log("Validating schedule format...");
      if (!validateMatchSchedule(schedule)) {
        setIsUploading(false)
        return
      }

      // Verificación adicional antes de subir
      const verification = confirm(`¿Confirmas que deseas subir ${schedule.length} partidos?\n\nPrimer partido: ${schedule[0].home_team} vs ${schedule[0].away_team}\nÚltimo partido: ${schedule[schedule.length-1].home_team} vs ${schedule[schedule.length-1].away_team}`);
      
      if (!verification) {
        setIsUploading(false);
        return;
      }

      console.log("Uploading to Supabase...");
      const { data, error } = await supabase.from("json_uploads").insert({
        type: "match_schedule",
        data: schedule,
        uploaded_by: "German Rauda",
      }).select()

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Upload successful:", data);
      alert("¡Calendario de partidos subido exitosamente!")
      setMatchSchedule("")
      
      // Esperar un momento antes de recargar
      setTimeout(() => {
        window.location.reload()
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof SyntaxError) {
        alert("Error: JSON inválido. Por favor verifica el formato")
      } else {
        alert(
          `Error al subir el calendario: ${
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message?: string }).message
              : String(error)
          }`
        )
      }
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
                  placeholder={`{
  "matches": [
    {
      "id": "1",
      "home_team": "MILAN",
      "away_team": "COLON",
      "date": "2025-06-16",
      "time": "18:00"
    },
    {
      "id": "2",
      "home_team": "VIBORAS",
      "away_team": "BAIGON",
      "date": "2025-06-16",
      "time": "18:45"
    },
    {
      "id": "3",
      "home_team": "ATLETICO GH",
      "away_team": "LION",
      "date": "2025-06-16",
      "time": "19:30"
    }
  ]
}`}
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
