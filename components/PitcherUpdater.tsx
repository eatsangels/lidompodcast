"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PitcherUpdaterProps {
  gameId: string;
  currentPitcher: string;
  onUpdate: (newPitcher: string) => Promise<void>;
}

export default function PitcherUpdater({
  gameId,
  currentPitcher,
  onUpdate
}: PitcherUpdaterProps) {
  const [pitcher, setPitcher] = useState(currentPitcher);
  const supabase = createClient();

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("live_games")
        .update({ current_pitcher: pitcher })
        .eq("id", gameId);

      if (error) throw error;
      await onUpdate(pitcher);
      alert("¡Lanzador actualizado correctamente!");
    } catch (error) {
      console.error("Error actualizando lanzador:", error);
      alert("Error al actualizar lanzador");
    }
  };

  return (
    <div className="p-4 space-y-2 border rounded-lg bg-white">
      <input
        type="text"
        value={pitcher}
        onChange={(e) => setPitcher(e.target.value)}
        placeholder="Nombre del lanzador"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleUpdate}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Actualizar Lanzador
      </button>
    </div>
  );
}