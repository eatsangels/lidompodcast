"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type LiveGame = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "pre" | "live" | "final";
  startTime: string;
};

export default function GameResults() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estado para la fecha seleccionada; inicialmente "hoy" (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const supabase = createClient();

  // Cada vez que cambie la fecha o la página, se cargan los juegos correspondientes
  useEffect(() => {
    fetchGames();
  }, [selectedDate, currentPage]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      // Se define el rango de fecha: desde selectedDate hasta el día siguiente.
      const startDate = selectedDate; // "YYYY-MM-DD"
      const endDateObj = new Date(selectedDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const endDate = endDateObj.toISOString();

      const { data, error, count } = await supabase
        .from("live_games")
        .select("*", { count: "exact" })
        .eq("status", "final")
        .gte("start_time", startDate)
        .lt("start_time", endDate)
        .order("start_time", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;
      
      setGames(
        (data || []).map((game) => ({
          id: game.id as string,
          homeTeam: game.home_team as string,
          awayTeam: game.away_team as string,
          homeScore: game.home_score as number,
          awayScore: game.away_score as number,
          status: game.status as "pre" | "live" | "final",
          startTime: game.start_time as string,
        }))
      );
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualiza la suscripción: si se actualiza un juego a "final" y su fecha coincide con la seleccionada, se actualiza el estado.
  const setupSubscription = () => {
    const channel = supabase
      .channel("live_games_results")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_games" },
        (payload) => {
          if (payload.new.status === "final") {
            const updatedDate = new Date(payload.new.start_time)
              .toISOString()
              .slice(0, 10);
            if (updatedDate === selectedDate) {
              const updatedGame: LiveGame = {
                id: payload.new.id,
                homeTeam: payload.new.home_team,
                awayTeam: payload.new.away_team,
                homeScore: payload.new.home_score,
                awayScore: payload.new.away_score,
                status: payload.new.status,
                startTime: payload.new.start_time,
              };
              // Actualiza el listado: si ya existe, lo reemplaza; si no, lo agrega al inicio.
              setGames((current) => {
                const exists = current.find((game) => game.id === updatedGame.id);
                if (exists) {
                  return current.map((game) =>
                    game.id === updatedGame.id ? updatedGame : game
                  );
                } else {
                  return [updatedGame, ...current];
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    const unsubscribe = setupSubscription();
    return () => unsubscribe();
  }, [selectedDate]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado con título y selector de fecha */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          Resultados Finales
        </h2>
        <div className="flex items-center gap-4">
          <label htmlFor="date" className="text-gray-700">
            Resultados por fecha:
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-2xl text-center text-gray-500 py-4 ">
          No hay resultados disponibles para la fecha seleccionada.
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id} className="overflow-hidden bg-red-900/100 ">
                {/* Header con degradado similar a LiveScore */}
                <div className="bg-gradient-to-r from-blue-900 to-red-800 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 ">
                      <span className="text-sm">
                        {new Date(game.startTime).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Final</span>
                    </div>
                  </div>
                </div>
                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center border-r-4 border-black pr-2 p-4">
                        <div className="font-semibold text-white">
                          {game.homeTeam}
                        </div>
                        <div className="text-3xl font-bold text-black">
                          {game.homeScore}
                        </div>
                      </div>
                      <div className="flex-1 text-center pl-2 p-4">
                        <div className="font-semibold text-white">
                          {game.awayTeam}
                        </div>
                        <div className="text-3xl font-bold text-black">
                          {game.awayScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                className="px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                className="px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
