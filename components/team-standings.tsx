"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Settings } from "lucide-react"
import { hasValidCredentials, supabase } from "@/lib/supabase"
import type { Team } from "@/lib/types"
import AdminPanel from "./admin-panel"

export default function TeamStandings() {
  const [standings, setStandings] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    loadStandings()
  }, [])

  const loadStandings = async () => {
    setIsLoading(true)
    try {
      if (!hasValidCredentials) {
        // Use mock data when Supabase is not configured
        const mockStandings = [
          {
            id: "1",
            name: "PSG",
            wins: 19,
            draws: 2,
            losses: 3,
            points: 59,
          },
          {
            id: "2",
            name: "Manchester City",
            wins: 18,
            draws: 4,
            losses: 2,
            points: 58,
          },
          {
            id: "3",
            name: "Liverpool",
            wins: 16,
            draws: 6,
            losses: 2,
            points: 54,
          },
          {
            id: "4",
            name: "Real Madrid",
            wins: 17,
            draws: 3,
            losses: 4,
            points: 54,
          },
          {
            id: "5",
            name: "Deportivo Saprissa",
            wins: 14,
            draws: 6,
            losses: 4,
            points: 48,
          },
        ]

        setStandings(mockStandings)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("teams").select("*").order("points", { ascending: false })

      if (error) throw error
      setStandings(data || [])
    } catch (error) {
      console.error("Error loading standings:", error)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Tabla de Posiciones</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const password = prompt("Ingresa la contraseña:");
              if (password === "champagne2023") {
                setShowAdminPanel(true);
              } else {
                alert("Contraseña incorrecta");
              }
            }}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Admin</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-amber-400/80 border-b border-white/10">
                <th className="text-left py-3 px-2">#</th>
                <th className="text-left py-3 px-2">Equipo</th>
                <th className="text-center py-3 px-2">PJ</th>
                <th className="text-center py-3 px-2">V</th>
                <th className="text-center py-3 px-2">E</th>
                <th className="text-center py-3 px-2">D</th>
                <th className="text-center py-3 px-2">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    index < 4 ? "bg-gradient-to-r from-amber-500/10 to-transparent" : ""
                  }`}
                >
                  <td className="py-3 px-2 text-white">
                    <div className="flex items-center">
                      <span className="font-bold">{index + 1}</span>
                      {index === 0 && <Trophy className="w-4 h-4 ml-1 text-amber-400" />}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-white font-medium">{team.name}</td>
                  <td className="py-3 px-2 text-white text-center">{team.wins + team.draws + team.losses}</td>
                  <td className="py-3 px-2 text-white text-center">{team.wins}</td>
                  <td className="py-3 px-2 text-white text-center">{team.draws}</td>
                  <td className="py-3 px-2 text-white text-center">{team.losses}</td>
                  <td className="py-3 px-2 text-amber-400 text-center font-bold">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </>
  )
}

