"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface Team {
  id: string;
  name: string;
  logo: string;
  wins: number;
  losses: number;
  games_played: number;
  win_percentage: number | null;
  games_behind: number;
  created_at?: string;
}

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: "",
    logo: "",
    wins: 0,
    losses: 0,
    games_behind: 0,
  });
  const [updatingTeamId, setUpdatingTeamId] = useState<string | null>(null);
  const [updateWins, setUpdateWins] = useState<number>(0);
  const [updateLosses, setUpdateLosses] = useState<number>(0);

  const supabase = createClient();

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("standings")
        .select("*")
        .order("win_percentage", { ascending: false });

      if (error) throw error;

      const teams = data.map((item) => ({
        id: item.id as string,
        name: item.name as string,
        logo: item.logo as string,
        wins: item.wins as number,
        losses: item.losses as number,
        games_played: item.games_played as number,
        win_percentage: item.win_percentage as number | null,
        games_behind: item.games_behind as number,
        created_at: item.created_at as string | undefined,
      })) as Team[];
      await updateGamesBehind(teams);
      setStandings(teams);
    } catch (error: any) {
      console.error("Error fetching standings:", error);
      setError("Error al cargar los equipos de la tabla de posiciones");
    } finally {
      setIsLoading(false);
    }
  };

  const updateGamesBehind = async (teams: Team[]) => {
    if (teams.length === 0) return;

    const leader = teams.reduce((max, team) =>
      team.wins > max.wins ? team : max
    , teams[0]);

    const updatedTeams = teams.map((team) => {
      const gb = (leader.wins - team.wins + team.losses - leader.losses) / 2;
      return { ...team, games_behind: gb >= 0 ? gb : 0 };
    });

    for (const team of updatedTeams) {
      await supabase
        .from("standings")
        .update({ games_behind: team.games_behind })
        .eq("id", team.id);
    }

    setStandings(updatedTeams);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!newTeam.name || !newTeam.logo) {
        throw new Error("El nombre y el logo son requeridos.");
      }
      if ((newTeam.wins || 0) < 0 || (newTeam.losses || 0) < 0) {
        throw new Error("Victorias y derrotas no pueden ser negativas.");
      }

      const { error, data } = await supabase
        .from("standings")
        .insert([newTeam as Record<string, unknown>])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const insertedTeam = data[0] as unknown as Team;
        const newTeams = [...standings, insertedTeam];
        await updateGamesBehind(newTeams);
        setStandings(newTeams);
        setNewTeam({ name: "", logo: "", wins: 0, losses: 0, games_behind: 0 });
      }
    } catch (error: any) {
      console.error("Error adding team:", error);
      setError(error.message || "Error al guardar el equipo en la tabla de posiciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (updateWins < 0 || updateLosses < 0) {
        throw new Error("Victorias y derrotas no pueden ser negativas.");
      }

      const { error, data } = await supabase
        .from("standings")
        .update({ wins: updateWins, losses: updateLosses })
        .eq("id", teamId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedTeam = data[0] as unknown as Team;
        const updatedTeams = standings.map((team) =>
          team.id === teamId ? updatedTeam : team
        );
        await updateGamesBehind(updatedTeams);
        setStandings(updatedTeams);
        setUpdatingTeamId(null);
        setUpdateWins(0);
        setUpdateLosses(0);
      }
    } catch (error: any) {
      console.error("Error updating team:", error);
      setError(error.message || "Error al actualizar las victorias y derrotas del equipo");
    } finally {
      setIsLoading(false);
    }
  };

  const standingsFields = ["name", "logo", "wins", "losses"];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Gestionar Tabla de Posiciones - LIDOM</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Card className="p-6 mb-8">
        <h3 className="text-2xl font-bold text-green-600 mb-6">Agregar Nuevo Equipo</h3>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standingsFields.map((key) => (
            <div key={key}>
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input
                id={key}
                name={key}
                type={key === "name" ? "text" : key === "logo" ? "url" : "number"}
                value={
                  key === "name"
                    ? newTeam.name
                    : key === "logo"
                    ? newTeam.logo
                    : key === "wins"
                    ? newTeam.wins
                    : newTeam.losses || 0
                }
                onChange={(e) =>
                  setNewTeam((prev) => ({
                    ...prev,
                    [key]:
                      key === "name" || key === "logo"
                        ? e.target.value
                        : Number(e.target.value) || 0,
                  }))
                }
                required={key === "name" || key === "logo"}
                min={key === "wins" || key === "losses" ? 0 : undefined}
                step={key === "wins" || key === "losses" ? 1 : undefined}
              />
            </div>
          ))}
          <div className="col-span-full">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Equipo"}
            </Button>
          </div>
        </form>
      </Card>

      {isLoading && !standings.length ? (
        <p className="mt-8 text-center text-gray-600">Cargando equipos...</p>
      ) : standings.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Equipos Actuales</h3>
          <div className="space-y-4">
            {standings.map((team) => (
              <Card key={team.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p><strong>Nombre:</strong> {team.name}</p>
                    <p><strong>Logo:</strong> <a href={team.logo} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{team.logo}</a></p>
                    <p><strong>Wins:</strong> {team.wins}</p>
                    <p><strong>Losses:</strong> {team.losses}</p>
                    <p><strong>Games Played:</strong> {team.games_played}</p>
                    <p><strong>Win %:</strong> {team.win_percentage != null ? team.win_percentage.toFixed(3).replace(/^0/, "") : ".000"}</p>
                    <p><strong>Games Behind:</strong> {team.games_behind.toFixed(1)}</p>
                  </div>
                  <div>
                    {updatingTeamId === team.id ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={updateWins}
                          onChange={(e) => setUpdateWins(Number(e.target.value) || 0)}
                          min={0}
                          step={1}
                          placeholder="Nuevas Victorias"
                        />
                        <Input
                          type="number"
                          value={updateLosses}
                          onChange={(e) => setUpdateLosses(Number(e.target.value) || 0)}
                          min={0}
                          step={1}
                          placeholder="Nuevas Derrotas"
                        />
                        <Button
                          onClick={() => handleUpdateSubmit(team.id)}
                          disabled={isLoading}
                          className="w-full bg-green-500 text-white hover:bg-green-600"
                        >
                          {isLoading ? "Actualizando..." : "Actualizar"}
                        </Button>
                        <Button
                          onClick={() => setUpdatingTeamId(null)}
                          variant="outline"
                          className="w-full mt-2"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setUpdatingTeamId(team.id);
                          setUpdateWins(team.wins);
                          setUpdateLosses(team.losses);
                        }}
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Actualizar Wins/Losses
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-600">No hay equipos registrados. Agrega uno arriba.</p>
      )}
    </div>
  );
}