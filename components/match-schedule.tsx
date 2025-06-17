"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Settings } from "lucide-react"
import AdminPanel from "./admin-panel"
import { hasValidCredentials, supabase } from "@/lib/supabase"

interface Match {
  id: string
  home_team: string
  away_team: string
  date: string
  time: string
  home_logo?: string
  away_logo?: string
}

export default function MatchSchedule() {
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      return []
    } catch (error) {
      console.error('Error initializing matches:', error)
      return []
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      console.log("Loading matches...");
      console.log("Has valid credentials:", hasValidCredentials);
      
      if (!hasValidCredentials) {
        console.log("Using mock data");
        // Use mock data when Supabase is not configured
        const mockMatches: Match[] = [
          {
            id: "1",
            home_team: "Barcelona",
            away_team: "Real Madrid",
            date: "2024-06-15",
            time: "20:00",
            home_logo: "/placeholder.svg?height=48&width=48",
            away_logo: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "2",
            home_team: "Manchester City",
            away_team: "Liverpool",
            date: "2024-06-16",
            time: "16:30",
            home_logo: "/placeholder.svg?height=48&width=48",
            away_logo: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "3",
            home_team: "PSG",
            away_team: "Bayern Munich",
            date: "2024-06-17",
            time: "21:00",
            home_logo: "/placeholder.svg?height=48&width=48",
            away_logo: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "4",
            home_team: "Inter Miami",
            away_team: "LA Galaxy",
            date: "2024-06-18",
            time: "19:30",
            home_logo: "/placeholder.svg?height=48&width=48",
            away_logo: "/placeholder.svg?height=48&width=48",
          },
          {
            id: "5",
            home_team: "Deportivo Saprissa",
            away_team: "Alajuelense",
            date: "2024-06-19",
            time: "20:00",
            home_logo: "/placeholder.svg?height=48&width=48",
            away_logo: "/placeholder.svg?height=48&width=48",
          },
        ]

        setMatches(mockMatches)
        setIsLoading(false)
        return
      }

      // Get the latest match schedule from json_uploads
      try {
        console.log("Fetching from Supabase...");
        const { data, error } = await supabase
          .from("json_uploads")
          .select("*")
          .eq("type", "match_schedule")
          .order("created_at", { ascending: false })
          .limit(1)

        console.log("Supabase response:", { data, error });

        if (error) {
          console.error("Error fetching matches:", error)
          setMatches([])
          return
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log("No data found")
          setMatches([])
          return
        }

        if (!data[0].data || !Array.isArray(data[0].data)) {
          console.log("Invalid data format:", data[0])
          setMatches([])
          return
        }

        console.log("Valid match data found:", data[0].data)
        // Normalizar los datos para asegurar consistencia
        const normalizedMatches = data[0].data.map((match: any) => ({
          id: match.id?.toString() || '',
          home_team: match.home_team || '',
          away_team: match.away_team || match.away_team_team || '', // Manejar ambos casos
          date: match.date || '',
          time: match.time || '',
          home_logo: match.home_logo || null,
          away_logo: match.away_logo || null
        }));
        console.log("Normalized matches:", normalizedMatches);
        setMatches(normalizedMatches)
      } catch (supabaseError) {
        console.error("Supabase operation failed:", supabaseError)
        setMatches([])
      }
    } catch (error) {
      console.error("Error loading matches:", error)
      setMatches([])
    }
    setIsLoading(false)
  }

  // Group matches by date
  const matchesByDate = useMemo(() => {
    try {
      if (!Array.isArray(matches)) {
        console.error('Matches is not an array:', matches);
        return {};
      }

      return matches.reduce(
        (acc, match) => {
          try {
            if (!match || !match.date) {
              console.error('Invalid match object:', match);
              return acc;
            }
            
            if (!acc[match.date]) {
              acc[match.date] = []
            }
            acc[match.date].push(match)
            return acc
          } catch (error) {
            console.error('Error processing match:', match, error);
            return acc;
          }
        },
        {} as Record<string, Match[]>,
      )
    } catch (error) {
      console.error('Error grouping matches by date:', error);
      return {};
    }
  }, [matches])

  // Sort dates and validate
  const sortedDates = Object.keys(matchesByDate).filter(date => {
    try {
      return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
    } catch {
      console.error('Invalid date:', date);
      return false;
    }
  }).sort()

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      // Crear la fecha en UTC agregando la hora para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Fecha inválida';
      }

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Guatemala"
      };

      console.log('Formatting date:', {
        original: dateString,
        parsed: date.toISOString(),
        formatted: date.toLocaleDateString("es-ES", options)
      });

      return date.toLocaleDateString("es-ES", options)
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  }

  // Truncate team names for mobile
  const truncateTeamName = (name: string, maxLength = 12) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center space-x-2 text-lg">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Programación de Partidos</span>
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
          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No hay partidos programados actualmente.</p>
            </div>
          ) : (
            <Tabs defaultValue={sortedDates[0] || "no-dates"} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4 bg-gray-800 border border-gray-600 w-full overflow-x-auto">
                {Array.isArray(sortedDates) && sortedDates.length > 0 ? (
                  sortedDates.slice(0, 5).map((date) => (
                    <TabsTrigger
                      key={date}
                      value={date}
                      className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 px-2 py-2 whitespace-nowrap"
                    >
                      {date ? (() => {
                        const [year, month, day] = date.split('-').map(num => parseInt(num));
                        const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                        return dateObj.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          timeZone: "America/Guatemala"
                        });
                      })() : "Fecha no válida"}
                    </TabsTrigger>
                  ))
                ) : (
                  <TabsTrigger value="no-dates" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400 px-2 py-2">
                    No hay fechas
                  </TabsTrigger>
                )}
              </TabsList>

              {Array.isArray(sortedDates) && sortedDates.length > 0 ? (
                sortedDates.map((date) => (
                  <TabsContent key={date} value={date} className="space-y-3">
                    <h3 className="text-base font-medium text-amber-400 mb-3">{formatDate(date)}</h3>
                    <div className="space-y-3">
                    {Array.isArray(matchesByDate[date]) ? matchesByDate[date].map((match) => (
                      <div
                        key={match.id}
                        className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <img
                                src={match.home_logo || "/placeholder.svg?height=32&width=32"}
                                alt={match.home_team}
                                className="w-6 h-6 rounded-full object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = "none";
                                  const sibling = target.nextElementSibling as HTMLDivElement;
                                  if (sibling) sibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-6 h-6 bg-gray-600 rounded-full items-center justify-center">
                                <span className="text-xs font-bold text-white">{match.home_team.substring(0, 2)}</span>
                              </div>
                            </div>
                            <span className="text-white font-medium text-sm truncate">
                              {truncateTeamName(match.home_team, 10)}
                            </span>
                          </div>

                          <div className="flex flex-col items-center px-3 flex-shrink-0">
                            <span className="text-amber-400 text-xs font-bold">VS</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span className="text-white text-xs">{match.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 justify-end flex-1 min-w-0">
                            <span className="text-white font-medium text-sm truncate text-right">
                              {truncateTeamName(match.away_team, 10)}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <img
                                src={match.away_logo || "/placeholder.svg?height=32&width=32"}
                                alt={match.away_team}
                                className="w-6 h-6 rounded-full object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = "none";
                                  const sibling = target.nextElementSibling as HTMLDivElement;
                                  if (sibling) sibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-6 h-6 bg-gray-600 rounded-full items-center justify-center">
                                <span className="text-xs font-bold text-white">{match.away_team.substring(0, 2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-400">
                        <p>No hay partidos para esta fecha</p>
                      </div>
                    )}
                    </div>
                  </TabsContent>
                ))
              ) : (
                <TabsContent value="no-dates" className="text-center py-8 text-gray-400">
                  <p>No hay partidos programados para mostrar.</p>
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </>
  )
}
