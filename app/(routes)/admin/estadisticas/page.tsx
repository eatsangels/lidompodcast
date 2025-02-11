"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

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

export default function AdminStatsPage() {
  const [battingStats, setBattingStats] = useState<BattingStats[]>([]);
  const [pitchingStats, setPitchingStats] = useState<PitchingStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBattingStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newStats = {
      player: formData.get("player") as string,
      position: formData.get("position") as string,
      team: formData.get("team") as string,
      games: formData.get("games") as string,
      ab: formData.get("ab") as string,
      runs: formData.get("runs") as string,
      hits: formData.get("hits") as string,
      doubles: formData.get("doubles") as string,
      triples: formData.get("triples") as string,
      hr: formData.get("hr") as string,
      rbi: formData.get("rbi") as string,
      bb: formData.get("bb") as string,
      so: formData.get("so") as string,
      sb: formData.get("sb") as string,
      cs: formData.get("cs") as string,
      avg: formData.get("avg") as string,
      obp: formData.get("obp") as string,
      slg: formData.get("slg") as string,
      ops: formData.get("ops") as string,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("batting_stats")
        .insert([newStats]);

      if (error) throw error;
      
      setBattingStats([...battingStats, newStats]);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error adding batting stats:", error);
      alert("Error al guardar las estadísticas de bateo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPitchingStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newStats = {
      player: formData.get("player") as string,
      team: formData.get("team") as string,
      games: formData.get("games") as string,
      w: formData.get("w") as string,
      l: formData.get("l") as string,
      era: formData.get("era") as string,
      gs: formData.get("gs") as string,
      sv: formData.get("sv") as string,
      ip: formData.get("ip") as string,
      h: formData.get("h") as string,
      r: formData.get("r") as string,
      er: formData.get("er") as string,
      bb: formData.get("bb") as string,
      so: formData.get("so") as string,
      whip: formData.get("whip") as string,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pitching_stats")
        .insert([newStats]);

      if (error) throw error;
      
      setPitchingStats([...pitchingStats, newStats]);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error adding pitching stats:", error);
      alert("Error al guardar las estadísticas de pitcheo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Administrar Estadísticas</h1>
        
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="bg-blue-900 grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="batting">Bateo</TabsTrigger>
            <TabsTrigger value="pitching">Pitcheo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batting">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Agregar Estadísticas de Bateo</h3>
              <form onSubmit={handleAddBattingStats} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="player">Jugador</Label>
                  <Input id="player" name="player" required />
                </div>
                <div>
                  <Label htmlFor="position">Posición</Label>
                  <Input id="position" name="position" required />
                </div>
                <div>
                  <Label htmlFor="team">Equipo</Label>
                  <Input id="team" name="team" required />
                </div>
                <div>
                  <Label htmlFor="games">Juegos</Label>
                  <Input id="games" name="games" type="number" required />
                </div>
                <div>
                  <Label htmlFor="ab">VB</Label>
                  <Input id="ab" name="ab" type="number" required />
                </div>
                <div>
                  <Label htmlFor="runs">C</Label>
                  <Input id="runs" name="runs" type="number" required />
                </div>
                <div>
                  <Label htmlFor="hits">H</Label>
                  <Input id="hits" name="hits" type="number" required />
                </div>
                <div>
                  <Label htmlFor="doubles">2B</Label>
                  <Input id="doubles" name="doubles" type="number" required />
                </div>
                <div>
                  <Label htmlFor="triples">3B</Label>
                  <Input id="triples" name="triples" type="number" required />
                </div>
                <div>
                  <Label htmlFor="hr">HR</Label>
                  <Input id="hr" name="hr" type="number" required />
                </div>
                <div>
                  <Label htmlFor="rbi">CI</Label>
                  <Input id="rbi" name="rbi" type="number" required />
                </div>
                <div>
                  <Label htmlFor="bb">BB</Label>
                  <Input id="bb" name="bb" type="number" required />
                </div>
                <div>
                  <Label htmlFor="so">P</Label>
                  <Input id="so" name="so" type="number" required />
                </div>
                <div>
                  <Label htmlFor="sb">BR</Label>
                  <Input id="sb" name="sb" type="number" required />
                </div>
                <div>
                  <Label htmlFor="cs">AR</Label>
                  <Input id="cs" name="cs" type="number" required />
                </div>
                <div>
                  <Label htmlFor="avg">PRO</Label>
                  <Input id="avg" name="avg" required />
                </div>
                <div>
                  <Label htmlFor="obp">OBP</Label>
                  <Input id="obp" name="obp" required />
                </div>
                <div>
                  <Label htmlFor="slg">SLG</Label>
                  <Input id="slg" name="slg" required />
                </div>
                <div>
                  <Label htmlFor="ops">OPS</Label>
                  <Input id="ops" name="ops" required />
                </div>
                <div className="col-span-full">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Estadísticas"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="pitching">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Agregar Estadísticas de Pitcheo</h3>
              <form onSubmit={handleAddPitchingStats} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="player">Jugador</Label>
                  <Input id="player" name="player" required />
                </div>
                <div>
                  <Label htmlFor="team">Equipo</Label>
                  <Input id="team" name="team" required />
                </div>
                <div>
                  <Label htmlFor="games">J</Label>
                  <Input id="games" name="games" type="number" required />
                </div>
                <div>
                  <Label htmlFor="w">G</Label>
                  <Input id="w" name="w" type="number" required />
                </div>
                <div>
                  <Label htmlFor="l">P</Label>
                  <Input id="l" name="l" type="number" required />
                </div>
                <div>
                  <Label htmlFor="era">EFE</Label>
                  <Input id="era" name="era" required />
                </div>
                <div>
                  <Label htmlFor="gs">JI</Label>
                  <Input id="gs" name="gs" type="number" required />
                </div>
                <div>
                  <Label htmlFor="sv">SV</Label>
                  <Input id="sv" name="sv" type="number" required />
                </div>
                <div>
                  <Label htmlFor="ip">IP</Label>
                  <Input id="ip" name="ip" required />
                </div>
                <div>
                  <Label htmlFor="h">H</Label>
                  <Input id="h" name="h" type="number" required />
                </div>
                <div>
                  <Label htmlFor="r">C</Label>
                  <Input id="r" name="r" type="number" required />
                </div>
                <div>
                  <Label htmlFor="er">CL</Label>
                  <Input id="er" name="er" type="number" required />
                </div>
                <div>
                  <Label htmlFor="bb">BB</Label>
                  <Input id="bb" name="bb" type="number" required />
                </div>
                <div>
                  <Label htmlFor="so">K</Label>
                  <Input id="so" name="so" type="number" required />
                </div>
                <div>
                  <Label htmlFor="whip">WHIP</Label>
                  <Input id="whip" name="whip" required />
                </div>
                <div className="col-span-full">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Estadísticas"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}