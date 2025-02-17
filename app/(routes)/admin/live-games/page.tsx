"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Circle, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BatterUpdater from "@/components/BatterUpdater";
import PitcherUpdater from "@/components/PitcherUpdater";

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
  currentBatter: string;
  currentPitcher: string;
};

const transformGame = (game: any): LiveGame => ({
  id: game.id,
  homeTeam: game.home_team,
  awayTeam: game.away_team,
  homeScore: game.home_score,
  awayScore: game.away_score,
  inning: game.inning,
  isTopInning: game.is_top_inning,
  outs: game.outs,
  firstBase: game.first_base,
  secondBase: game.second_base,
  thirdBase: game.third_base,
  status: game.status,
  startTime: game.start_time,
  balls: game.balls,
  strikes: game.strikes,
  currentBatter: game.current_batter,
  currentPitcher: game.current_pitcher
});

export default function AdminLiveGamesPage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalGames, setTotalGames] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const supabase = createClient();
  const teams = [
    "Águilas Cibaeñas",
    "Tigres del Licey",
    "Gigantes del Cibao",
    "Estrellas Orientales",
    "Leones del Escogido",
    "Toros del Este",
  ];

  useEffect(() => {
    fetchGames();
  }, [currentPage, selectedDate]);

  useEffect(() => {
    const channel = supabase
      .channel("live_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_games" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newGameData = payload.new;
            if (
              newGameData.start_time &&
              newGameData.start_time.startsWith(selectedDate)
            ) {
              if (currentPage === 1) {
                setGames((current) =>
                  [transformGame(newGameData), ...current].slice(0, pageSize)
                );
              }
              setTotalGames((prev) => prev + 1);
            }
          } else if (payload.eventType === "UPDATE") {
            setGames((current) =>
              current.map((game) =>
                game.id === payload.new.id ? transformGame(payload.new) : game
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGames((current) =>
              current.filter((game) => game.id !== payload.old.id)
            );
            setTotalGames((prev) => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, currentPage]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize - 1;
      const startDate = new Date(selectedDate + "T00:00:00Z");
      const endDate = new Date(selectedDate + "T23:59:59.999Z");
  
      const { data, error, count } = await supabase
        .from("live_games")
        .select("*", { count: "exact" })
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("created_at", { ascending: false })
        .range(start, end);
  
      if (error) throw error;
      setGames((data || []).map(transformGame));
      setTotalGames(count ?? 0);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGame = async () => {
    try {
      setIsCreating(true);
      const { error } = await supabase.from("live_games").insert([
        {
          home_team: teams[0],
          away_team: teams[1],
          start_time: new Date().toISOString(),
          status: "pre",
          current_batter: "Por determinar",
          current_pitcher: "Por determinar"
        },
      ]);
      if (error) throw error;
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchGames();
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error al crear el juego");
    } finally {
      setIsCreating(false);
    }
  };

  const updateGame = async (id: string, updates: Partial<LiveGame>) => {
    const currentGame = games.find((game) => game.id === id);
    if (!currentGame) return;

    let finalUpdates = { ...updates };

    if (updates.outs !== undefined && updates.outs === 3) {
      finalUpdates = {
        ...finalUpdates,
        outs: 0,
        firstBase: false,
        secondBase: false,
        thirdBase: false,
        balls: 0,
        strikes: 0,
        isTopInning: !currentGame.isTopInning,
      };
    }

    const snakeCaseUpdates: any = {
      current_batter: finalUpdates.currentBatter,
      current_pitcher: finalUpdates.currentPitcher
    };
    
    if (finalUpdates.homeTeam !== undefined)
      snakeCaseUpdates.home_team = finalUpdates.homeTeam;
    if (finalUpdates.awayTeam !== undefined)
      snakeCaseUpdates.away_team = finalUpdates.awayTeam;
    if (finalUpdates.homeScore !== undefined)
      snakeCaseUpdates.home_score = finalUpdates.homeScore;
    if (finalUpdates.awayScore !== undefined)
      snakeCaseUpdates.away_score = finalUpdates.awayScore;
    if (finalUpdates.inning !== undefined)
      snakeCaseUpdates.inning = finalUpdates.inning;
    if (finalUpdates.isTopInning !== undefined)
      snakeCaseUpdates.is_top_inning = finalUpdates.isTopInning;
    if (finalUpdates.outs !== undefined)
      snakeCaseUpdates.outs = finalUpdates.outs;
    if (finalUpdates.firstBase !== undefined)
      snakeCaseUpdates.first_base = finalUpdates.firstBase;
    if (finalUpdates.secondBase !== undefined)
      snakeCaseUpdates.second_base = finalUpdates.secondBase;
    if (finalUpdates.thirdBase !== undefined)
      snakeCaseUpdates.third_base = finalUpdates.thirdBase;
    if (finalUpdates.status !== undefined)
      snakeCaseUpdates.status = finalUpdates.status;
    if (finalUpdates.startTime !== undefined)
      snakeCaseUpdates.start_time = finalUpdates.startTime;
    if (finalUpdates.balls !== undefined)
      snakeCaseUpdates.balls = finalUpdates.balls;
    if (finalUpdates.strikes !== undefined)
      snakeCaseUpdates.strikes = finalUpdates.strikes;

    try {
      const { data, error } = await supabase
        .from("live_games")
        .update(snakeCaseUpdates)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        const updatedGame: LiveGame = transformGame(data[0]);
        setGames((current) =>
          current.map((game) => (game.id === id ? updatedGame : game))
        );
      }
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Error al actualizar el juego");
    }
  };

  const totalPages = Math.ceil(totalGames / pageSize) || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen from-black/95 to-blue-900 bg-gradient-to-b bg-cover bg-center">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-500 shadow-md shadow-red-500 rounded-xl p-4">
            Juegos en Vivo
          </h1>
          <div className="flex space-x-4 items-center">
            <Label htmlFor="dateFilter" className="text-white">
              Fecha:
            </Label>
            <Input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 p-2"
            />
            <Button
              onClick={createGame}
              disabled={isCreating}
              className="bg-blue-900 text-black"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Nuevo Juego
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          {games.map((game) => (
            <Card key={game.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Información del Juego
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Estado</Label>
                      <select
                        className="w-full mt-1 rounded-md border border-gray-300 p-2"
                        value={game.status}
                        onChange={(e) =>
                          updateGame(game.id, {
                            status: e.target.value as LiveGame["status"],
                          })
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
                        <select
                          className="w-full mt-1 rounded-md border border-gray-300 p-2"
                          value={game.homeTeam}
                          onChange={(e) =>
                            updateGame(game.id, { homeTeam: e.target.value })
                          }
                        >
                          {teams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Equipo Visitante</Label>
                        <select
                          className="w-full mt-1 rounded-md border border-gray-300 p-2"
                          value={game.awayTeam}
                          onChange={(e) =>
                            updateGame(game.id, { awayTeam: e.target.value })
                          }
                        >
                          {teams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
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

                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Estado del Juego
                  </h3>
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
                            onClick={() =>
                              updateGame(game.id, { outs: out + 1 })
                            }
                            className={`p-2 rounded-full ${
                              game.outs > out
                                ? "bg-red-900 text-white"
                                : "bg-blue-900"
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

                    <div>
                      <Label>Bateador Actual</Label>
                      <div className="mt-2">
                        <BatterUpdater 
                          gameId={game.id} 
                          currentBatter={game.currentBatter}
                          onUpdate={(newBatter) => 
                            updateGame(game.id, { currentBatter: newBatter })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Lanzador Actual</Label>
                      <div className="mt-2">
                        <PitcherUpdater 
                          gameId={game.id} 
                          currentPitcher={game.currentPitcher}
                          onUpdate={(newPitcher) => 
                            updateGame(game.id, { currentPitcher: newPitcher })
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

        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-900 text-white"
          >
            Anterior
          </Button>
          <span className="text-white">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-blue-900 text-white"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}