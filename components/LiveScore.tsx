"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, Clock, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LiveGame = {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  inning: number;
  is_top_inning: boolean;
  outs: number;
  first_base: boolean;
  second_base: boolean;
  third_base: boolean;
  status: "pre" | "live" | "final";
  start_time: string;
  balls: number;
  strikes: number;
  current_batter: string;
  current_pitcher: string;
};

type GamePlay = {
  id: string;
  game_id: string;
  play_order: number;
  inning: number;
  is_top_inning: boolean;
  play_type: string;
  description: string;
  outs: number | null;
  first_base: boolean | null;
  second_base: boolean | null;
  third_base: boolean | null;
  balls: number | null;
  strikes: number | null;
  created_at: string;
};

const getTeamStyle = (teamName: string) => {
  switch (teamName.toLowerCase()) {
    case "tigres del licey":
      return { logo: "/logos/licey.png" };
    case "águilas cibaeñas":
      return { logo: "/logos/aguilas.png" };
    case "toros del este":
      return { logo: "/logos/toros.png" };
    case "leones del escogido":
      return { logo: "/logos/escogido.png" };
    case "gigantes del cibao":
      return { logo: "/logos/gigantes.png" };
    case "estrellas orientales":
      return { logo: "/logos/estrellas.png" };
    default:
      return { logo: "/logos/default.png" };
  }
};

export default function LiveScore() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});
  const [gamePlays, setGamePlays] = useState<Record<string, GamePlay[]>>({});

  useEffect(() => {
    fetchGames();
    setupLiveGamesSubscription();
  }, []);

  const setupLiveGamesSubscription = () => {
    const channel = supabase
      .channel("live_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_games" },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new.status === "live") {
            setLiveGames((current) => [payload.new as LiveGame, ...current]);
          } else if (payload.eventType === "UPDATE") {
            setLiveGames((current) =>
              current.map((game) =>
                game.id === payload.new.id ? (payload.new as LiveGame) : game
              )
            );
          } else if (payload.eventType === "DELETE") {
            setLiveGames((current) =>
              current.filter((game) => game.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from("live_games")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLiveGames((data as LiveGame[]) || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGamePlays = async (gameId: string) => {
    const { data, error } = await supabase
      .from("game_plays")
      .select("*")
      .eq("game_id", gameId)
      .order("play_order", { ascending: false });

    if (error) {
      console.error("Error fetching plays for game", gameId, error);
    } else {
      const plays = (data as GamePlay[]) || [];
      setGamePlays((prev) => ({ ...prev, [gameId]: plays }));
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("game_plays_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_plays" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPlay = payload.new as GamePlay;
            setGamePlays((prev) => {
              const playsForGame = prev[newPlay.game_id] || [];
              return {
                ...prev,
                [newPlay.game_id]: [newPlay, ...playsForGame]
              };
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedPlay = payload.new as GamePlay;
            setGamePlays((prev) => {
              const playsForGame = prev[updatedPlay.game_id] || [];
              const newPlays = playsForGame.map((p) =>
                p.id === updatedPlay.id ? updatedPlay : p
              );
              return {
                ...prev,
                [updatedPlay.game_id]: newPlays.sort((a, b) => b.play_order - a.play_order),
              };
            });
          } else if (payload.eventType === "DELETE") {
            const deletedPlay = payload.old as GamePlay;
            setGamePlays((prev) => {
              const playsForGame = prev[deletedPlay.game_id] || [];
              const newPlays = playsForGame.filter((p) => p.id !== deletedPlay.id);
              return { ...prev, [deletedPlay.game_id]: newPlays };
            });
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (liveGames.length === 0) {
    return (
      <Card className="w-[480px] max-w-7xl mx-auto px-1 py-2 bg-gradient-to-b from-red-900/10 to-red-800/70 shadow-lg shadow-red-500">
        <img
          src="images/fondo.jpg"
          alt="card-image"
          className="h-full w-full object-cover"
        />
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-white-900 mb-2">No hay juegos en vivo</h2>
          <p className="text-white">Vuelve más tarde para ver los próximos juegos</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Radio className="h-5 w-5 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">En Vivo</h2>
        </div>
        <Button variant="outline" size="sm" className="text-blue-900">
          Ver Todos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {liveGames.map((game) => {
          const homeStyle = getTeamStyle(game.home_team);
          const awayStyle = getTeamStyle(game.away_team);

          return (
            <Card key={game.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Entrada {game.inning}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {game.is_top_inning ? "Parte Alta" : "Parte Baja"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={awayStyle.logo}
                        alt={`${game.away_team} logo`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{game.away_team}</span>
                    </div>
                    <span className="text-2xl font-bold">{game.away_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={homeStyle.logo}
                        alt={`${game.home_team} logo`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{game.home_team}</span>
                    </div>
                    <span className="text-2xl font-bold">{game.home_score}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg text-gray-500 mb-2">Outs</div>
                      <div className="flex justify-center space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <Circle
                            key={i}
                            fill={i < game.outs ? "#f44336" : "none"}
                            className={`h-4 w-4 ${
                              i < game.outs ? "text-red-900" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-center space-x-2">
                      <div className="text-lg text-gray-500 mb-4 text-left">
                        Bases
                      </div>
                      <div className="relative w-8 h-8 mx-auto transform">
                        <div
                          className={`absolute -top-2 left-1/2 transform rotate-45 -translate-x-1/2 w-4 h-4 ${
                            game.second_base ? "bg-yellow-300" : "bg-gray-200"
                          }`}
                        />
                        <div
                          className={`absolute top-1/2 -left-2 rotate-45 transform -translate-y-1/2 w-4 h-4 ${
                            game.third_base ? "bg-yellow-300" : "bg-gray-200"
                          }`}
                        />
                        <div
                          className={`absolute top-1/2 -right-2 rotate-45 transform -translate-y-1/2 w-4 h-4 ${
                            game.first_base ? "bg-yellow-300" : "bg-gray-200"
                          }`}
                        />
                        <div className="absolute -bottom-2 rotate-45 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-200/1" />
                      </div>
                    </div>

                    <div className="text-center border rounded-lg p-1 bg-gray-800 shadow-lg shadow-blue-600">
                      <div className="flex flex-col space-y-2">
                        <div className="text-lg font-medium text-white">
                          Conteo
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="bg-blue-50 px-4 py-2 rounded-md">
                            <span className="text-xl font-bold text-blue-900">
                              {game.balls}
                            </span>
                            <span className="text-xs block mt-1 text-blue-600">
                              BOLAS
                            </span>
                          </div>
                          <div className="h-8 w-px bg-gray-200"></div>
                          <div className="bg-red-50 px-2 py-2 rounded-md">
                            <span className="text-xl font-bold text-red-600">
                              {game.strikes}
                            </span>
                            <span className="text-xs block mt-1 text-red-500">
                              STRIKES
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 w-max mx-auto">
                      <p className="text-sm text-green-600 font-semibold">
                        BATEADOR DE TURNO / ACCION EN BASE
                      </p>
                      <p className="text-xl text-white font-bold truncate">
                        {game.current_batter || "Por determinar"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 mx-auto">
                    <div className="text-sm text-yellow-300 font-semibold uppercase">
                      EN LA LOMITA
                    </div>
                    <div className="text-xl text-white font-medium truncate">
                      {game.current_pitcher || "Por determinar"}
                    </div>
                  </div>
                </div>

                {/* Sección de historial de jugadas */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExpandedGames((prev) => {
                        const newVal = !prev[game.id];
                        if (newVal && !gamePlays[game.id]) {
                          fetchGamePlays(game.id);
                        }
                        return { ...prev, [game.id]: newVal };
                      });
                    }}
                  >
                    {expandedGames[game.id] ? "Ocultar Jugadas" : "Mostrar Jugadas"}
                  </Button>
                </div>

                {expandedGames[game.id] && (
                  <div className="mt-2 border-t border-gray-300 pt-2">
                    {gamePlays[game.id] ? (
                      gamePlays[game.id].map((play) => {
                        let parsedDescription: any;
                        try {
                          const descWithoutPrefix = play.description.replace(/^Actualización:\s*/, "");
                          parsedDescription = JSON.parse(descWithoutPrefix);
                        } catch (e) {
                          parsedDescription = play.description;
                        }
                        
                        return (
                          <div key={play.id} className="py-1 border-b last:border-b-0">
                            <div className="text-sm text-gray-600 flex justify-between">
                              <span>
                                {play.play_order}. {play.play_type}
                              </span>
                              <span>
  {new Date(play.created_at).toLocaleTimeString('es-ES', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}
</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {typeof parsedDescription === "object" ? (
                                <ul className="list-disc list-inside">
                                  {Object.entries(parsedDescription).map(([key, value]) => {
                                    // Reemplazar homeScore/awayScore con nombres de equipos
                                    const displayKey = key === 'homeScore' 
                                      ? game.home_team 
                                      : key === 'awayScore' 
                                        ? game.away_team 
                                        : key;

                                    // Formatear valores especiales
                                    const displayValue = typeof value === 'boolean' 
                                      ? (value ? 'Ocupada' : 'Vacía')
                                      : key === 'inning'
                                        ? `Entrada ${value}`
                                        : key === 'is_top_inning'
                                          ? (value ? 'Parte Alta' : 'Parte Baja')
                                          : value;

                                    return (
                                      <li key={key}>
                                        <strong>{displayKey}:</strong> {String(displayValue)}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                parsedDescription
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500">Cargando jugadas...</div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}