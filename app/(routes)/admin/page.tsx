"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login"); // Redirigir si no está autenticado
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [supabase, router]);

  // Manejar la creación de nuevos administradores
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Guardar rol de administrador en la base de datos
      const { error: roleError } = await supabase
        .from("profiles")
        .insert([{ email, role: "admin" }]);

      if (roleError) throw roleError;

      setMessage("Administrador creado exitosamente.");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage("Error al crear la cuenta: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-blue-900">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">
        Bienvenido al Panel de Administración
      </h1>
      <p className="text-gray-600 mb-8">
       Crea un nuevo usuario para que tenga rol de Admin, el cual puede agregar noticias.
      </p>

      <Card className="p-6 shadow-md bg-black hover:bg-gray-900">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4 ">
          Crear nuevo administrador
        </h2>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full bg-blue-900 text-white hover:bg-blue-950">
            Crear Administrador
          </Button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </Card>
    </div>
  );
}
