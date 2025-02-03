"use client";

import { useEffect, useState, useCallback } from "react";
import { Table } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { debounce } from "lodash";

type BattingStats = {
  player: string;
  position: string;
  team: string;
  games: string;
  ab: string;
  runs: string;
  hits: string;
  doubles: string;
  triples: string;
  hr: string;
  rbi: string;
  bb: string;
  so: string;
  sb: string;
  cs: string;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
};

type PitchingStats = {
  player: string;
  team: string;
  games: string;
  w: string;
  l: string;
  era: string;
  gs: string;
  sv: string;
  ip: string;
  h: string;
  r: string;
  er: string;
  bb: string;
  so: string;
  whip: string;
};

export default function EstadisticaPage() {
  const [battingStats, setBattingStats] = useState<BattingStats[]>([]);
  const [pitchingStats, setPitchingStats] = useState<PitchingStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"batting" | "pitching">("batting");

  const supabase = createClient();

  const debounceSearch = useCallback(
    debounce((query) => setDebouncedQuery(query), 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchQuery);
    return () => debounceSearch.cancel();
  }, [searchQuery, debounceSearch]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (activeTab === "batting") {
        let query = supabase
          .from("batting_stats")
          .select("*")
          .order("avg", { ascending: false });

        if (debouncedQuery) {
          query = query.ilike("player", `%${debouncedQuery}%`);
        } else {
          query = query.limit(10);
        }

        const { data, error } = await query;
        if (error) throw error;
        setBattingStats(data as BattingStats[] || []);
      } else {
        let query = supabase
          .from("pitching_stats")
          .select("*")
          .order("era", { ascending: true });

        if (debouncedQuery) {
          query = query.ilike("player", `%${debouncedQuery}%`);
        } else {
          query = query.limit(10);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPitchingStats(data as PitchingStats[] || []);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedQuery, supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/Fondo.jpg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Estadísticas
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Rendimiento actualizado de nuestros jugadores en la temporada actual
            </p>
            <div className="mt-8 max-w-2xl mx-auto">
              <Input
                placeholder="Buscar jugador por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/90 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg mx-auto max-w-17xl px-4 py-16 sm:px-6 lg:px-8">
        <Tabs 
          defaultValue="batting" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as "batting" | "pitching")}
        >
          <TabsList className="bg-blue-900 grid w-full grid-cols-2">
            <TabsTrigger value="batting">Bateo</TabsTrigger>
            <TabsTrigger value="pitching">Pitcheo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batting">
            <Card className="p-6">
              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                {debouncedQuery ? 
                  `Resultados de búsqueda para "${debouncedQuery}"` : 
                  "Líderes de Bateo Lidom 2024-2025"}
              </h3>
              {isLoading ? (
                <div className="text-center py-8">Cargando estadísticas...</div>
              ) : battingStats.length === 0 ? (
                <div className="text-center py-8">No se encontraron jugadores</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Jugador</th>
                        <th className="text-center py-3 px-4">Pos</th>
                        <th className="text-center py-3 px-4">Equipo</th>
                        <th className="text-center py-3 px-4">J</th>
                        <th className="text-center py-3 px-4">TB</th>
                        <th className="text-center py-3 px-4">C</th>
                        <th className="text-center py-3 px-4">H</th>
                        <th className="text-center py-3 px-4">2B</th>
                        <th className="text-center py-3 px-4">3B</th>
                        <th className="text-center py-3 px-4">HR</th>
                        <th className="text-center py-3 px-4">CI</th>
                        <th className="text-center py-3 px-4">BB</th>
                        <th className="text-center py-3 px-4">P</th>
                        <th className="text-center py-3 px-4">BR</th>
                        <th className="text-center py-3 px-4">AR</th>
                        <th className="text-center py-3 px-4">PRO</th>
                        <th className="text-center py-3 px-4">OBP</th>
                        <th className="text-center py-3 px-4">SLG</th>
                        <th className="text-center py-3 px-4">OPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battingStats.map((player, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{player.player}</td>
                          <td className="text-center py-3 px-4">{player.position}</td>
                          <td className="text-center py-3 px-4">{player.team}</td>
                          <td className="text-center py-3 px-4">{player.games}</td>
                          <td className="text-center py-3 px-4">{player.ab}</td>
                          <td className="text-center py-3 px-4">{player.runs}</td>
                          <td className="text-center py-3 px-4">{player.hits}</td>
                          <td className="text-center py-3 px-4">{player.doubles}</td>
                          <td className="text-center py-3 px-4">{player.triples}</td>
                          <td className="text-center py-3 px-4">{player.hr}</td>
                          <td className="text-center py-3 px-4">{player.rbi}</td>
                          <td className="text-center py-3 px-4">{player.bb}</td>
                          <td className="text-center py-3 px-4">{player.so}</td>
                          <td className="text-center py-3 px-4">{player.sb}</td>
                          <td className="text-center py-3 px-4">{player.cs}</td>
                          <td className="text-center py-3 px-4">{player.avg}</td>
                          <td className="text-center py-3 px-4">{player.obp}</td>
                          <td className="text-center py-3 px-4">{player.slg}</td>
                          <td className="text-center py-3 px-4">{player.ops}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="pitching">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                {debouncedQuery ? 
                  `Resultados de búsqueda para "${debouncedQuery}"` : 
                  "Líderes de Pitcheo Lidom 2024-2025"}
              </h3>
              {isLoading ? (
                <div className="text-center py-8">Cargando estadísticas...</div>
              ) : pitchingStats.length === 0 ? (
                <div className="text-center py-8">No se encontraron jugadores</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Jugador</th>
                        <th className="text-center py-3 px-4">Equipo</th>
                        <th className="text-center py-3 px-4">J</th>
                        <th className="text-center py-3 px-4">G</th>
                        <th className="text-center py-3 px-4">P</th>
                        <th className="text-center py-3 px-4">EFE</th>
                        <th className="text-center py-3 px-4">JI</th>
                        <th className="text-center py-3 px-4">SV</th>
                        <th className="text-center py-3 px-4">IP</th>
                        <th className="text-center py-3 px-4">H</th>
                        <th className="text-center py-3 px-4">C</th>
                        <th className="text-center py-3 px-4">CL</th>
                        <th className="text-center py-3 px-4">BB</th>
                        <th className="text-center py-3 px-4">K</th>
                        <th className="text-center py-3 px-4">WHIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pitchingStats.map((player, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{player.player}</td>
                          <td className="text-center py-3 px-4">{player.team}</td>
                          <td className="text-center py-3 px-4">{player.games}</td>
                          <td className="text-center py-3 px-4">{player.w}</td>
                          <td className="text-center py-3 px-4">{player.l}</td>
                          <td className="text-center py-3 px-4">{player.era}</td>
                          <td className="text-center py-3 px-4">{player.gs}</td>
                          <td className="text-center py-3 px-4">{player.sv}</td>
                          <td className="text-center py-3 px-4">{player.ip}</td>
                          <td className="text-center py-3 px-4">{player.h}</td>
                          <td className="text-center py-3 px-4">{player.r}</td>
                          <td className="text-center py-3 px-4">{player.er}</td>
                          <td className="text-center py-3 px-4">{player.bb}</td>
                          <td className="text-center py-3 px-4">{player.so}</td>
                          <td className="text-center py-3 px-4">{player.whip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}