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

const getTeamLogo = (teamName: string) => {
  switch (teamName.toLowerCase()) {
    case "tigres del licey":
      return "/logos/licey.png";
    case "águilas cibaeñas":
      return "/logos/aguilas.png";
    case "toros del este":
      return "/logos/toros.png";
    case "leones del escogido":
      return "/logos/escogido.png";
    case "gigantes del cibao":
      return "/logos/gigantes.png";
    case "estrellas orientales":
      return "/logos/estrellas.png";
    default:
      return "/logos/default.png";
  }
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

  // Suscripción para actualizaciones a "final"
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
                const exists = current.find((g) => g.id === updatedGame.id);
                if (exists) {
                  return current.map((g) =>
                    g.id === updatedGame.id ? updatedGame : g
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
    <div className="relative min-h-screen bg-gradient-to-t from-blue-500/90 to-black py-10 px-4 overflow-hidden">
      {/* Shape Divider Superior (invertido con rotate-180) */}
      <div className="absolute inset-x-0 top-0 overflow-hidden leading-[0] rotate-180">
        <svg
          className="block w-full h-20 text-white"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64L48,80C96,96,192,128,288,154.7C384,181,480,203,576,208C672,213,768,203,864,181.3C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-4xl font-extrabold text-white mb-6 md:mb-0">
            Resultados Finales
          </h2>
          <div className="flex items-center gap-4">
            <label htmlFor="date" className="text-white text-lg">
              Resultados por fecha:
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-3xl text-center text-white py-10 relative z-10">
          No hay resultados disponibles para la fecha seleccionada.
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {games.map((game) => (
              <Card
                key={game.id}
                className="overflow-hidden rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105"
              >
                {/* Header con degradado */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">
                        {new Date(game.startTime).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">Final</span>
                    </div>
                  </div>
                </div>
                {/* Contenido de la tarjeta */}
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between">
                    {/* Equipo local */}
                    <div className="flex-1 text-center border-r border-gray-300 pr-4">
                      <img
                        src={getTeamLogo(game.homeTeam)}
                        alt={`${game.homeTeam} logo`}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-3"
                      />
                      <div className="font-semibold text-gray-800 text-lg">
                        {game.homeTeam}
                      </div>
                      <div className="text-4xl font-bold text-gray-900">
                        {game.homeScore}
                      </div>
                    </div>
                    {/* Equipo visitante */}
                    <div className="flex-1 text-center pl-4">
                      <img
                        src={getTeamLogo(game.awayTeam)}
                        alt={`${game.awayTeam} logo`}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-3"
                      />
                      <div className="font-semibold text-gray-800 text-lg">
                        {game.awayTeam}
                      </div>
                      <div className="text-4xl font-bold text-gray-900">
                        {game.awayScore}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="max-w-7xl mx-auto flex items-center justify-center mt-10 gap-6 relative z-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-xl text-white">
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Shape Divider Inferior */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden leading-[0]">
        <svg
          className="block w-full h-32 text-white"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64L48,80C96,96,192,128,288,154.7C384,181,480,203,576,208C672,213,768,203,864,181.3C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
}
