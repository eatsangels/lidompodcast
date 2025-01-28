"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          if (window.location.pathname !== '/admin/login') {
            router.push("/admin/login");
          }
          return;
        }

        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
        setError(errorMessage);
        
        if (errorMessage.includes('connect to Supabase')) {
          // Show a more user-friendly message for missing Supabase connection
          setError('Por favor, conecte Supabase para acceder al panel de administración');
        } else {
          console.error("Error checking auth status:", err);
        }

        if (window.location.pathname !== '/admin/login') {
          router.push("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }

      router.push("/admin/login");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      console.error("Error signing out:", err);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes('connect to Supabase') && (
            <p className="text-sm text-gray-500">
              Haga clic en el botón "Connect to Supabase" en la esquina superior derecha para configurar la autenticación.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold text-blue-900">Panel de Administración</div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando sesión...
                </>
              ) : (
                'Cerrar Sesión'
              )}
            </Button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}