"use client";

import { useEffect, useState, useCallback } from "react";
import { Table } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { debounce } from "lodash";
import {
  ArrowRight,
  Trophy,
  Calendar,
  Star,
  Users,
  MicVocal,
  Newspaper,
} from "lucide-react";

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
        setBattingStats((data as BattingStats[]) || []);
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
        setPitchingStats((data as PitchingStats[]) || []);
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

  // Datos de los equipos de la LIDOM con cantidad de campeonatos y Series del Caribe
  const teams = [
    {
      name: "Tigres del Licey",
      logo: "/logos/licey.png",
      url: "/estadistica/tigres",
      championships: 24,
      caribbeanSeries: 11,
    },
    {
      name: "Águilas Cibaeñas",
      logo: "/logos/aguilas.png",
      url: "/estadistica/aguilas",
      championships: 22,
      caribbeanSeries: 6,
    },
    {
      name: "Leones del Escogido",
      logo: "/logos/escogido.png",
      url: "/estadistica/leones",
      championships: 17,
      caribbeanSeries: 5,
    },
    {
      name: "Toros del Este",
      logo: "/logos/toros.png",
      url: "/estadistica/toros",
      championships: 3,
      caribbeanSeries: 1,
    },
    {
      name: "Estrellas Orientales",
      logo: "/logos/estrellas.png",
      url: "/estadistica/estrellas",
      championships: 3,
      caribbeanSeries: 0,
    },
    {
      name: "Gigantes del Cibao",
      logo: "/logos/gigantes.png",
      url: "/estadistica/gigantes",
      championships: 2,
      caribbeanSeries: 0,
    },
  ];

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
      <div className="bg mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Tabs
          defaultValue="batting"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as "batting" | "pitching")}
        >
          <TabsList className="bg-blue-900 grid w-full grid-cols-2">
            <TabsTrigger value="batting">Bateo</TabsTrigger>
            <TabsTrigger value="pitching">Pitcheo</TabsTrigger>
          </TabsList>

          {/* BATEO */}
          <TabsContent value="batting">
            <Card className="p-6">
              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                {debouncedQuery
                  ? `Resultados de búsqueda para "${debouncedQuery}"`
                  : "Líderes de Bateo Lidom 2024-2025"}
              </h3>

              {isLoading ? (
                <div className="text-center py-8">Cargando estadísticas...</div>
              ) : battingStats.length === 0 ? (
                <div className="text-center py-8">No se encontraron jugadores</div>
              ) : (
                <>
                  {/* Tabla (solo en pantallas medianas en adelante) */}
                  <div className="hidden md:block">
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

                  {/* Vista en tarjetas (solo en pantallas pequeñas) */}
                  <div className="md:hidden space-y-4">
                    {battingStats.map((player, index) => (
                      <div
                        key={index}
                        className="bg-black/80 text-white rounded p-4 shadow"
                      >
                        <h4 className="text-lg font-bold mb-2">{player.player}</h4>
                        <p>Posición: {player.position}</p>
                        <p>Equipo: {player.team}</p>
                        <p>Juegos: {player.games}</p>
                        <p>Turnos al bate: {player.ab}</p>
                        <p>Carreras: {player.runs}</p>
                        <p>Hits: {player.hits}</p>
                        <p>Dobles: {player.doubles}</p>
                        <p>Triples: {player.triples}</p>
                        <p>HR: {player.hr}</p>
                        <p>CI: {player.rbi}</p>
                        <p>BB: {player.bb}</p>
                        <p>SO: {player.so}</p>
                        <p>BR: {player.sb}</p>
                        <p>AR: {player.cs}</p>
                        <p>AVG: {player.avg}</p>
                        <p>OBP: {player.obp}</p>
                        <p>SLG: {player.slg}</p>
                        <p>OPS: {player.ops}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          {/* PITCHEO */}
          <TabsContent value="pitching">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                {debouncedQuery
                  ? `Resultados de búsqueda para "${debouncedQuery}"`
                  : "Líderes de Pitcheo Lidom 2024-2025"}
              </h3>
              {isLoading ? (
                <div className="text-center py-8">Cargando estadísticas...</div>
              ) : pitchingStats.length === 0 ? (
                <div className="text-center py-8">No se encontraron jugadores</div>
              ) : (
                <>
                  {/* Tabla en pantallas medianas en adelante */}
                  <div className="hidden md:block">
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

                  {/* Vista en tarjetas (solo en pantallas pequeñas) */}
                  <div className="md:hidden space-y-4">
                    {pitchingStats.map((player, index) => (
                      <div
                        key={index}
                        className="bg-black/80 text-white rounded p-4 shadow"
                      >
                        <h4 className="text-lg font-bold mb-2">{player.player}</h4>
                        <p>Equipo: {player.team}</p>
                        <p>J: {player.games}</p>
                        <p>G: {player.w}</p>
                        <p>P: {player.l}</p>
                        <p>EFE: {player.era}</p>
                        <p>JI: {player.gs}</p>
                        <p>SV: {player.sv}</p>
                        <p>IP: {player.ip}</p>
                        <p>H: {player.h}</p>
                        <p>C: {player.r}</p>
                        <p>CL: {player.er}</p>
                        <p>BB: {player.bb}</p>
                        <p>K: {player.so}</p>
                        <p>WHIP: {player.whip}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sección de Equipos */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Equipos de la Liga LIDOM
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {teams.map((team) => (
            <Card
              key={team.name}
              className="flex flex-col items-center bg-gray-900 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={team.logo}
                alt={team.name}
                className="w-full h-32 object-contain p-4"
              />
              <div className="p-4 text-center">
                <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                <div className="flex flex-col items-center mb-2 space-y-1">
                  <div className="flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-300">
                      {team.championships} Campeonatos
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-400 mr-1" />
                    <span className="text-sm text-gray-300">
                      {team.caribbeanSeries} Series del Caribe
                    </span>
                  </div>
                </div>
                <a
                  href={team.url}
                  className="inline-block bg-blue-900 text-white px-4 py-2 rounded"
                >
                  Ir a Estadística
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
