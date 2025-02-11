"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Definimos el contexto de sesión
const SessionContext = createContext<any>(null);

// Hook para usar el contexto de sesión en cualquier componente
export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Obtener la sesión actual al montar el componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Suscribirse a los cambios de sesión
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Limpiar la suscripción al desmontar
    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
