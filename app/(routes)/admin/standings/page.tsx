"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
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
      <div className="h-screen flex justify-center items-center bg-indigo-50">
        <div className="flex items-center gap-2 text-indigo-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-black p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Administración LIDOM
          </h1>
          <p className="text-gray-600 text-lg">Gestión de Tabla de Posiciones</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
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
          <div className="text-center py-12">
            <p className="text-gray-500">No hay equipos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {standings.map((team) => (
                <Card key={team.id} className="p-6 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-indigo-900">
                        {team.name}
                        <span className="block w-8 h-1 bg-emerald-500 mt-1 rounded-full"/>
                      </h3>
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={team.name} 
                          className="h-12 w-12 object-contain rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"/> Victorias
                        </p>
                        <p className="text-2xl font-bold text-gray-800">{team.wins}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-400 rounded-full"/> Derrotas
                        </p>
                        <p className="text-2xl font-bold text-gray-800">{team.losses}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Porcentaje</p>
                        <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm w-fit">
                          {team.win_percentage?.toFixed(3).replace(/^0/, "") || ".000"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Games Behind</p>
                        <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm w-fit">
                          {team.games_behind}
                        </div>
                      </div>
                    </div>

                    {updatingTeamId === team.id ? (
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <Input
                          type="number"
                          value={updateWins}
                          onChange={(e) => setUpdateWins(Number(e.target.value) || 0)}
                          className="focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nuevas Victorias"
                        />
                        <Input
                          type="number"
                          value={updateLosses}
                          onChange={(e) => setUpdateLosses(Number(e.target.value) || 0)}
                          className="focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nuevas Derrotas"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateSubmit(team.id)}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                          >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                            {isLoading ? "Actualizando..." : "Guardar"}
                          </Button>
                          <Button
                            onClick={() => setUpdatingTeamId(null)}
                            variant="outline"
                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setUpdatingTeamId(team.id);
                          setUpdateWins(team.wins);
                          setUpdateLosses(team.losses);
                        }}
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        Editar Registro
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}