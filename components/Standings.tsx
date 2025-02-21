"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface Team {
  id: string;
  name: string;
  logo: string;
  wins: number;
  losses: number;
  games_played: number;
  win_percentage: number | null;
  games_behind: number;
}

const Standings: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from("standings")
        .select("id, name, logo, wins, losses, games_played, win_percentage, games_behind");

      if (error) {
        console.error("Error fetching standings:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const teamsData = data as Team[];
        await updateGamesBehind(teamsData); // Calcular dinámicamente games_behind
        setTeams(teamsData);
      }
      setLoading(false);
    };

    fetchTeams();
  }, []);

  const updateGamesBehind = async (teams: Team[]) => {
    if (teams.length === 0) return;

    // Encontrar al líder basado en victorias
    const leader = teams.reduce((max, team) => (team.wins > max.wins ? team : max), teams[0]);

    // Calcular games_behind para cada equipo
    const updatedTeams = teams.map((team) => {
      const gb = (leader.wins - team.wins + team.losses - leader.losses) / 2;
      return { ...team, games_behind: gb >= 0 ? gb : 0 }; // Asegurar que GB no sea negativo
    });

    // Actualizar los valores en la base de datos (opcional, si quieres persistirlos)
    for (const team of updatedTeams) {
      await supabase
        .from("standings")
        .update({ games_behind: team.games_behind })
        .eq("id", team.id);
    }

    setTeams(updatedTeams);
  };

  const closeModal = () => setIsOpen(false);

  const formatPercentage = (value: number | null) => {
    if (value === null) return ".000";
    const str = value.toFixed(3);
    return str.startsWith("0.") ? str.substring(1) : str;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center mb-4 sm:mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-7 rounded-lg text-sm"
        >
          Ver Tabla de Posiciones - LIDOM 2025- 2026
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-black p-4 rounded-lg sm:rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-300 text-lg font-bold"
              >
                ×
              </button>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 text-blue-700 flex items-center justify-center gap-2">
              <img
                src="/logos/logo.png"
                alt="LIDOM Logo"
                className="relative h-16 w-16 rounded-full shadow-inner shadow-blue-400 spin-container"
              />
              Tabla de Posiciones - <span className="text-red-500">LIDOM</span> 2025- 2026
            </h2>
            {loading ? (
              <p className="text-center text-sm sm:text-base">Cargando...</p>
            ) : teams.length === 0 ? (
              <p className="text-center text-sm sm:text-base">No hay datos disponibles</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-1 sm:p-2 border border-gray-300">#</th>
                      <th className="p-1 sm:p-2 border border-gray-300">Equipo</th>
                      <th className="p-1 sm:p-2 border border-gray-300">G</th>
                      <th className="p-1 sm:p-2 border border-gray-300">P</th>
                      <th className="p-1 sm:p-2 border border-gray-300">JJ</th>
                      <th className="p-1 sm:p-2 border border-gray-300">Pct</th>
                      <th className="p-1 sm:p-2 border border-gray-300">GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams
                      .sort((a, b) => (b.win_percentage || 0) - (a.win_percentage || 0))
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className="text-center hover:bg-gray-700 transition-colors"
                        >
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {index + 1}
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="w-4 h-4 sm:w-6 sm:h-6"
                            />
                            <span className="truncate">{team.name}</span>
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {team.wins}
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {team.losses}
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {team.games_played}
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {formatPercentage(team.win_percentage)}
                          </td>
                          <td className="p-1 sm:p-2 border border-gray-300">
                            {team.games_behind === 0 ? "-" : team.games_behind.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        .spin-container {
          display: inline-block;
          animation: spin 4s linear infinite;
        }
        .spin-container:hover {
          animation-play-state: paused;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Standings;