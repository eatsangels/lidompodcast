import { Table } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EstadisticaPage() {
  const battingStats = [
    {
      player: "J.C.Escarra",
      avg: ".363",
      hr: "3",
      rbi: "14",
      runs: "22",
      sb: "1",
    },
    {
      player: "AderlinRodríguez",
      avg: ".323",
      hr: "8",
      rbi: "28",
      runs: "22",
      sb: "1",
    },
    {
      player: "Jerar Encarnacion",
      avg: ".297",
      hr: "34",
      rbi: "24",
      runs: "22",
      sb: "12",
    },
  ];

  const pitchingStats = [
    {
      player: "Enny Romero",
      era: "1.24",
      w: "6",
      l: "1",
      so: "47",
      saves: "0",
    },
    {
      player: "Nabil Crismatt",
      era: "2.65",
      w: "5",
      l: "2",
      so: "49",
      saves: "0",
    },
    
    {
      player: "Wily Peralta",
      era: "2.85",
      w: "2",
      l: "5",
      so: "30",
      saves: "0",
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
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="bg-blue-900 grid w-full grid-cols-2">
            <TabsTrigger value="batting">Bateo</TabsTrigger>
            <TabsTrigger value="pitching">Pitcheo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batting">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Líderes de Bateo Lidom 2024-2025 </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Jugador</th>
                      <th className="text-center py-3 px-4">AVG</th>
                      <th className="text-center py-3 px-4">HR</th>
                      <th className="text-center py-3 px-4">RBI</th>
                      <th className="text-center py-3 px-4">R</th>
                      <th className="text-center py-3 px-4">SB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingStats.map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{player.player}</td>
                        <td className="text-center py-3 px-4">{player.avg}</td>
                        <td className="text-center py-3 px-4">{player.hr}</td>
                        <td className="text-center py-3 px-4">{player.rbi}</td>
                        <td className="text-center py-3 px-4">{player.runs}</td>
                        <td className="text-center py-3 px-4">{player.sb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="pitching">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Líderes de Pitcheo Lidom 2024-2025</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Jugador</th>
                      <th className="text-center py-3 px-4">ERA</th>
                      <th className="text-center py-3 px-4">G</th>
                      <th className="text-center py-3 px-4">P</th>
                      <th className="text-center py-3 px-4">SO</th>
                      <th className="text-center py-3 px-4">SV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitchingStats.map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{player.player}</td>
                        <td className="text-center py-3 px-4">{player.era}</td>
                        <td className="text-center py-3 px-4">{player.w}</td>
                        <td className="text-center py-3 px-4">{player.l}</td>
                        <td className="text-center py-3 px-4">{player.so}</td>
                        <td className="text-center py-3 px-4">{player.saves}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Stats */}
      {/* <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <div className="text-4xl font-bold text-white">.285</div>
              <div className="mt-2 text-blue-100">Promedio de Bateo</div>
            </div>
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <div className="text-4xl font-bold text-white">3.25</div>
              <div className="mt-2 text-blue-100">ERA del Equipo</div>
            </div>
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <div className="text-4xl font-bold text-white">85</div>
              <div className="mt-2 text-blue-100">Home Runs</div>
            </div>
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <div className="text-4xl font-bold text-white">42</div>
              <div className="mt-2 text-blue-100">Bases Robadas</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}