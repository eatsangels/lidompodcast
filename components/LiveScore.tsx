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
};

export default function LiveScore() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Función que retorna las iniciales y el color de fondo según el nombre del equipo
  const getTeamStyle = (teamName: string) => {
    switch (teamName.toLowerCase()) {
      case "tigres del licey":
        return { initials: "LIC", bgColor: "bg-blue-900" };
      case "águilas cibaeñas":
      
        return { initials: "AGU", bgColor: "bg-yellow-500" };
      case "toros":
        return { initials: "TE", bgColor: "bg-orange-500" };
      case "escogido":
        return { initials: "E", bgColor: "bg-red-500" };
      case "gigantes del cibao":
        return { initials: "G", bgColor: "bg-red-950" }; // Puedes ajustar el color según prefieras
      case "estrellas":
        return { initials: "EO", bgColor: "bg-green-500" };
      default:
        return { initials: teamName.slice(0, 3).toUpperCase(), bgColor: "bg-gray-500" };
    }
  };

  useEffect(() => {
    // Cargamos los datos iniciales
    fetchGames();
    // Configuramos la suscripción para actualizar cuando la base de datos reciba nueva información
    setupSubscription();
  }, []);

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

  const setupSubscription = () => {
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay juegos en vivo</h2>
          <p className="text-gray-600">Vuelve más tarde para ver los próximos juegos</p>
        </div>
      </div>
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
              {/* Game Header */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Entrada {game.inning}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {game.is_top_inning ? "Alta" : "Baja"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Content */}
              <div className="p-6">
                {/* Teams and Scores */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${homeStyle.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-white">
                          {homeStyle.initials}
                        </span>
                      </div>
                      <span className="font-medium">{game.home_team}</span>
                    </div>
                    <span className="text-2xl font-bold">{game.home_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${awayStyle.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-white">
                          {awayStyle.initials}
                        </span>
                      </div>
                      <span className="font-medium">{game.away_team}</span>
                    </div>
                    <span className="text-2xl font-bold">{game.away_score}</span>
                  </div>
                </div>

                {/* Game Status */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Outs */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">Outs</div>
                      <div className="flex justify-center space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <Circle
                            key={i}
                            fill={i < game.outs ? "#1e3a8a" : "none"}
                            className={`h-4 w-4 ${
                              i < game.outs ? "text-blue-900" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Diamond */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-4">Bases</div>
                      <div className="relative w-8 h-8 mx-auto transform ">
                        
                        {/* Second Base */}
                        <div
                          className={`absolute -top-2 left-1/2 transform rotate-45 -translate-x-1/2 w-4 h-4 ${
                            game.second_base ? "bg-blue-900" : "bg-gray-200"
                          }`}
                        />
                        {/* Third Base */}
                        <div
                          className={`absolute top-1/2 -left-2 rotate-45 transform -translate-y-1/2 w-4 h-4 ${
                            game.third_base ? "bg-blue-900" : "bg-gray-200"
                          }`}
                        />
                        {/* First Base */}
                        <div
                          className={`absolute top-1/2 -right-2 rotate-45 transform -translate-y-1/2 w-4 h-4 ${
                            game.first_base ? "bg-blue-900" : "bg-gray-200"
                          }`}
                        />
                        {/* Home Plate */}
                        <div className="absolute -bottom-2 rotate-45 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-200" />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">Cuenta</div>
                      <div className="font-mono text-lg">
                        <span className="text-blue-900">{game.balls}</span>-
                        <span className="text-red-500">{game.strikes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
