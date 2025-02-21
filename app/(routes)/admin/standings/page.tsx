"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  win_percentage?: number;
  games_behind: number;
  created_at?: Date;
}

export default function AdminStandingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [standings, setStandings] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para evitar mostrar contenido antes de verificar autenticación
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
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login"); // Redirigir a la página de login si no está autenticado
        return;
      }

      // Si está autenticado, cargar los equipos
      await fetchStandings();
    };

    checkAuth();
  }, [supabase, router]);

  // Cargar equipos desde Supabase
  const fetchStandings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("standings")
        .select("*")
        .order("win_percentage", { ascending: false });

      if (error) {
        throw new Error(`Error fetching standings: ${error.message}`);
      }

      console.log("Datos recibidos de Supabase:", data);
      setStandings((data as unknown as Team[]) || []);
    } catch (error: any) {
      console.error("Error fetching standings:", error);
      setError(error.message || "Error al cargar los equipos");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la creación de un nuevo equipo
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase
        .from("standings")
        .insert([newTeam as Record<string, unknown>])
        .select();

      if (error) throw new Error(`Error adding team: ${error.message}`);

      setStandings((prevStandings) => [
        ...prevStandings,
        {
          id: data[0].id,
          name: data[0].name,
          logo: data[0].logo,
          wins: data[0].wins,
          losses: data[0].losses,
          win_percentage: data[0].win_percentage,
          games_behind: data[0].games_behind,
          created_at: data[0].created_at,
        } as Team,
      ]);
      setNewTeam({ name: "", logo: "", wins: 0, losses: 0, games_behind: 0 });
    } catch (error: any) {
      console.error("Error adding team to standings:", error);
      setError(error.message || "Error al guardar el equipo");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la actualización de wins y losses de un equipo
  const handleUpdateSubmit = async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase
        .from("standings")
        .update({ wins: updateWins, losses: updateLosses })
        .eq("id", teamId)
        .select();

      if (error) throw new Error(`Error updating team: ${error.message}`);

      setStandings((prevStandings) =>
        prevStandings.map((team) =>
          team.id === teamId ? { ...team, wins: updateWins, losses: updateLosses, win_percentage: data?.[0]?.win_percentage as number | undefined } : team
        )
      );
      setUpdatingTeamId(null);
      setUpdateWins(0);
      setUpdateLosses(0);
    } catch (error: any) {
      console.error("Error updating team standings:", error);
      setError(error.message || "Error al actualizar las victorias y derrotas");
    } finally {
      setIsLoading(false);
    }
  };

  const standingsFields = ["name", "logo", "wins", "losses", "games_behind"];

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-blue-900">Verificando autenticación y cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Gestionar Tabla de Posiciones - LIDOM</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* <Card className="p-6">
        <h3 className="text-2xl font-bold text-green-600 mb-6">Agregar Nuevo Equipo</h3>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standingsFields.map((key) => (
            <div key={key}>
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input
                id={key}
                name={key}
                type={key === "logo" ? "url" : "number"}
                value={
                  key === "name"
                    ? newTeam.name
                    : key === "logo"
                    ? newTeam.logo
                    : key === "wins"
                    ? newTeam.wins
                    : key === "losses"
                    ? newTeam.losses
                    : (newTeam.games_behind || 0)
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
                required={key !== "games_behind"}
                min={key === "wins" || key === "losses" || key === "games_behind" ? 0 : undefined}
                step={key === "wins" || key === "losses" || key === "games_behind" ? 1 : undefined}
              />
            </div>
          ))}
          <div className="col-span-full">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Equipo"}
            </Button>
          </div>
        </form>
      </Card> */}

      {standings.length === 0 ? (
        <p className="mt-8 text-center text-gray-600">No hay equipos registrados. Agrega uno arriba.</p>
      ) : (
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
                    <p><strong>Win %:</strong> {team.win_percentage?.toFixed(3).replace(/^0/, "") || ".000"}</p>
                    <p><strong>Games Behind:</strong> {team.games_behind}</p>
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
      )}
    </div>
  );
}