"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

const battingFields = [
  "player", "position", "team", "games", "ab", "runs", "hits", "doubles", "triples", "hr", "rbi", "bb", "so", "sb", "cs", "avg", "obp", "slg", "ops"
];

const pitchingFields = [
  "player", "team", "games", "w", "l", "era", "gs", "sv", "ip", "h", "r", "er", "bb", "so", "whip"
];

export default function AdminStatsPage() {
  const [battingStats, setBattingStats] = useState<{ [key: string]: string | number }[]>([]);
  const [pitchingStats, setPitchingStats] = useState<{ [key: string]: string | number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, table: string, setStats: React.Dispatch<React.SetStateAction<any[]>>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const newStats: { [key: string]: string | number } = {};

    formData.forEach((value, key) => {
        let numValue = Number(value);
        if (!isNaN(numValue) && key.match(/^(avg|obp|slg|ops|era|whip)$/)) {
          newStats[key] = numValue.toFixed(3).replace(/^0/, ""); // Elimina el "0" antes del punto
        } else {
          newStats[key] = isNaN(numValue) ? String(value) : numValue;
        }
      });
      

    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).insert([newStats]);

      if (error) throw error;

      setStats((prevStats) => [...prevStats, newStats]);
      if (form) {
        form.reset();
      }
    } catch (error) {
      console.error(`Error adding stats to ${table}:`, error);
      alert(`Error al guardar las estadísticas en ${table}`);
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
          {[
            { value: "batting", label: "Bateo", table: "batting_stats", setStats: setBattingStats, fields: battingFields },
            { value: "pitching", label: "Pitcheo", table: "pitching_stats", setStats: setPitchingStats, fields: pitchingFields }
          ].map(({ value, label, table, setStats, fields }) => (
            <TabsContent key={value} value={value}>
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-green-600 mb-6">Agregar Estadísticas de {label}</h3>
                <form onSubmit={(e) => handleSubmit(e, table, setStats)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map((key) => (
                    <div key={key}>
                      <Label htmlFor={key}>{key.toUpperCase()}</Label>
                      <Input id={key} name={key} required />
                    </div>
                  ))}
                  <div className="col-span-full">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar Estadísticas"}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
