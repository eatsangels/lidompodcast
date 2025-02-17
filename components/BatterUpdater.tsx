"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BatterUpdaterProps {
  gameId: string;
  currentBatter: string;
  onUpdate: (newBatter: string) => Promise<void> | void;
}

export default function BatterUpdater({ 
  gameId, 
  currentBatter,
  onUpdate 
}: BatterUpdaterProps) {
  const [batter, setBatter] = useState(currentBatter);
  const supabase = createClient();

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("live_games")
        .update({ current_batter: batter })
        .eq("id", gameId);

      if (error) throw error;
      await onUpdate(batter); // Ejecutar callback después de actualizar
      alert("¡Bateador actualizado correctamente!");
    } catch (error) {
      console.error("Error updating batter:", error);
      alert("Error actualizando bateador");
    }
  };

  return (
    <div className="p-4 space-y-2 border rounded-lg bg-white">
      <input
        type="text"
        value={batter}
        onChange={(e) => setBatter(e.target.value)}
        placeholder="Nombre del bateador"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Actualizar Bateador
      </button>
    </div>
  );
}