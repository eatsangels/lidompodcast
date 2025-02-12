"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Circle, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";


type LiveGame = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  inning: number;
  isTopInning: boolean;
  outs: number;
  firstBase: boolean;
  secondBase: boolean;
  thirdBase: boolean;
  status: "pre" | "live" | "final";
  startTime: string;
  balls: number;
  strikes: number;
};

export default function AdminLiveGamesPage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchGames();
    setupSubscription();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from("live_games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGames(
        (data || []).map((game) => ({
          id: game.id as string,
          homeTeam: game.home_team as string,
          awayTeam: game.away_team as string,
          homeScore: game.home_score as number,
          awayScore: game.away_score as number,
          inning: game.inning as number,
          isTopInning: game.is_top_inning as boolean,
          outs: game.outs as number,
          firstBase: game.first_base as boolean,
          secondBase: game.second_base as boolean,
          thirdBase: game.third_base as boolean,
          status: game.status as "pre" | "live" | "final",
          startTime: game.start_time as string,
          balls: game.balls as number,
          strikes: game.strikes as number,
        }))
      );
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
          // Nota: si prefieres confiar en la suscripción para actualizar la UI,
          // asegúrate de transformar payload.new de snake_case a camelCase.
          if (payload.eventType === "INSERT") {
            const newGame = payload.new;
            const transformedGame: LiveGame = {
              id: newGame.id,
              homeTeam: newGame.home_team,
              awayTeam: newGame.away_team,
              homeScore: newGame.home_score,
              awayScore: newGame.away_score,
              inning: newGame.inning,
              isTopInning: newGame.is_top_inning,
              outs: newGame.outs,
              firstBase: newGame.first_base,
              secondBase: newGame.second_base,
              thirdBase: newGame.third_base,
              status: newGame.status,
              startTime: newGame.start_time,
              balls: newGame.balls,
              strikes: newGame.strikes,
            };
            setGames((current) => [transformedGame, ...current]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            const transformedGame: LiveGame = {
              id: updated.id,
              homeTeam: updated.home_team,
              awayTeam: updated.away_team,
              homeScore: updated.home_score,
              awayScore: updated.away_score,
              inning: updated.inning,
              isTopInning: updated.is_top_inning,
              outs: updated.outs,
              firstBase: updated.first_base,
              secondBase: updated.second_base,
              thirdBase: updated.third_base,
              status: updated.status,
              startTime: updated.start_time,
              balls: updated.balls,
              strikes: updated.strikes,
            };
            setGames((current) =>
              current.map((game) =>
                game.id === transformedGame.id ? transformedGame : game
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGames((current) =>
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

  const createGame = async () => {
    try {
      setIsCreating(true);
      const { error } = await supabase.from("live_games").insert([
        {
          home_team: "Tigres del Licey",
          away_team: "Águilas Cibaeñas",
          start_time: "19:00",
          status: "pre",
        },
      ]);
      if (error) throw error;
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error al crear el juego");
    } finally {
      setIsCreating(false);
    }
  };

  const updateGame = async (id: string, updates: Partial<LiveGame>) => {
    // Encontrar el juego actual para acceder a su estado
    const currentGame = games.find(game => game.id === id);
    if (!currentGame) return;
  
    let finalUpdates = { ...updates };
  
    // Lógica de limpieza al alcanzar 3 outs
    if (updates.outs !== undefined) {
      if (updates.outs === 3) {
        finalUpdates = {
          ...finalUpdates,
          outs: 0, // Reiniciar contador de outs
          firstBase: false, // Limpiar bases
          secondBase: false,
          thirdBase: false,
          balls: 0, // Reiniciar conteo de lanzamientos
          strikes: 0,
          isTopInning: !currentGame.isTopInning, // Cambiar de mitad de entrada
        };
      }
    }
  
    // Convertir a snake_case
    const snakeCaseUpdates: any = {};
    if (finalUpdates.homeTeam !== undefined) snakeCaseUpdates.home_team = finalUpdates.homeTeam;
    if (finalUpdates.awayTeam !== undefined) snakeCaseUpdates.away_team = finalUpdates.awayTeam;
    if (finalUpdates.homeScore !== undefined) snakeCaseUpdates.home_score = finalUpdates.homeScore;
    if (finalUpdates.awayScore !== undefined) snakeCaseUpdates.away_score = finalUpdates.awayScore;
    if (finalUpdates.inning !== undefined) snakeCaseUpdates.inning = finalUpdates.inning;
    if (finalUpdates.isTopInning !== undefined) snakeCaseUpdates.is_top_inning = finalUpdates.isTopInning;
    if (finalUpdates.outs !== undefined) snakeCaseUpdates.outs = finalUpdates.outs;
    if (finalUpdates.firstBase !== undefined) snakeCaseUpdates.first_base = finalUpdates.firstBase;
    if (finalUpdates.secondBase !== undefined) snakeCaseUpdates.second_base = finalUpdates.secondBase;
    if (finalUpdates.thirdBase !== undefined) snakeCaseUpdates.third_base = finalUpdates.thirdBase;
    if (finalUpdates.status !== undefined) snakeCaseUpdates.status = finalUpdates.status;
    if (finalUpdates.startTime !== undefined) snakeCaseUpdates.start_time = finalUpdates.startTime;
    if (finalUpdates.balls !== undefined) snakeCaseUpdates.balls = finalUpdates.balls;
    if (finalUpdates.strikes !== undefined) snakeCaseUpdates.strikes = finalUpdates.strikes;
  
    try {
      const { data, error } = await supabase
        .from("live_games")
        .update(snakeCaseUpdates)
        .eq("id", id)
        .select();
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        const updatedRow = data[0];
        const updatedGame: LiveGame = {
          id: updatedRow.id as string,
          homeTeam: updatedRow.home_team as string,
          awayTeam: updatedRow.away_team as string,
          homeScore: updatedRow.home_score as number,
          awayScore: updatedRow.away_score as number,
          inning: updatedRow.inning as number,
          isTopInning: updatedRow.is_top_inning as boolean,
          outs: updatedRow.outs as number,
          firstBase: updatedRow.first_base as boolean,
          secondBase: updatedRow.second_base as boolean,
          thirdBase: updatedRow.third_base as boolean,
          status: updatedRow.status as "pre" | "live" | "final",
          startTime: updatedRow.start_time as string,
          balls: updatedRow.balls as number,
          strikes: updatedRow.strikes as number,
        };
  
        setGames(current => 
          current.map(game => game.id === id ? updatedGame : game)
        );
      }
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Error al actualizar el juego");
    }
  };
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Juegos en Vivo</h1>
          <Button
            onClick={createGame}
            disabled={isCreating}
            className="bg-blue-900"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Nuevo Juego
          </Button>
        </div>

        <div className="grid gap-8">
          {games.map((game) => (
            <Card key={game.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Game Info */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Información del Juego</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Estado</Label>
                      <select
                        className="w-full mt-1 rounded-md border border-gray-300 p-2"
                        value={game.status}
                        onChange={(e) =>
                          updateGame(game.id, { status: e.target.value as LiveGame["status"] })
                        }
                      >
                        <option value="pre">Pre-juego</option>
                        <option value="live">En Vivo</option>
                        <option value="final">Final</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Equipo Local</Label>
                        <Input
                          value={game.homeTeam}
                          onChange={(e) =>
                            updateGame(game.id, { homeTeam: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Equipo Visitante</Label>
                        <Input
                          value={game.awayTeam}
                          onChange={(e) =>
                            updateGame(game.id, { awayTeam: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Carreras Local</Label>
                        <Input
                          type="number"
                          value={game.homeScore}
                          onChange={(e) =>
                            updateGame(game.id, {
                              homeScore: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Carreras Visitante</Label>
                        <Input
                          type="number"
                          value={game.awayScore}
                          onChange={(e) =>
                            updateGame(game.id, {
                              awayScore: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Status */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Estado del Juego</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Entrada</Label>
                        <Input
                          type="number"
                          value={game.inning}
                          onChange={(e) =>
                            updateGame(game.id, {
                              inning: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Alta/Baja</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            checked={game.isTopInning}
                            onCheckedChange={(checked) =>
                              updateGame(game.id, { isTopInning: checked })
                            }
                          />
                          <span>{game.isTopInning ? "Alta" : "Baja"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Outs</Label>
                      <div className="flex space-x-2 mt-2">
                        {[0, 1, 2].map((out) => (
                          <button
                            key={out}
                            onClick={() => updateGame(game.id, { outs: out + 1 })}
                            className={`p-2 rounded-full ${
                              game.outs > out
                                ? "bg-blue-900 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <Circle className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Bases</Label>
                      <div className="flex space-x-4 mt-2">
                        <Switch
                          checked={game.firstBase}
                          onCheckedChange={(checked) =>
                            updateGame(game.id, { firstBase: checked })
                          }
                        />
                        <Switch
                          checked={game.secondBase}
                          onCheckedChange={(checked) =>
                            updateGame(game.id, { secondBase: checked })
                          }
                        />
                        <Switch
                          checked={game.thirdBase}
                          onCheckedChange={(checked) =>
                            updateGame(game.id, { thirdBase: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bolas</Label>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          value={game.balls}
                          onChange={(e) =>
                            updateGame(game.id, {
                              balls: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Strikes</Label>
                        <Input
                          type="number"
                          min="0"
                          max="3"
                          value={game.strikes}
                          onChange={(e) =>
                            updateGame(game.id, {
                              strikes: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
