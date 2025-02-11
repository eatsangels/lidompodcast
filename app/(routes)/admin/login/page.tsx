"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthFormData = {
  email: string;
  password: string;
};

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>();
  const supabase = createClient();

  // Verificamos si hay una sesión activa al montar el componente
  useEffect(() => {
    async function checkSession() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    }
    checkSession();
  }, [supabase]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null); // Limpiamos cualquier error previo

      let error;
      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        error = signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        error = signInError;
      }

      if (error) {
        setErrorMessage(
          isRegistering
            ? "Error al registrarse. Por favor, inténtalo de nuevo."
            : "Credenciales inválidas. Por favor, revisa tu correo y contraseña."
        );
        return;
      }

      setSuccessMessage(
        isRegistering
          ? "Registro exitoso. Redirigiendo..."
          : "Inicio de sesión exitoso. Redirigiendo..."
      );

      setTimeout(() => {
        router.push("/admin/noticias");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        isRegistering
          ? "Error al registrarse. Por favor, inténtalo de nuevo."
          : "Error al iniciar sesión. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya hay una sesión activa, mostramos un mensaje y un botón para ir al panel
  if (session) {
    return (
      <div className="min-h-screen bg-black-50 bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-8">Ya has iniciado sesión</h1>
          <Button onClick={() => router.push("/admin/noticias")} className="w-full">
            Puedes Editar Noticias y Estadistica
          </Button>
        </Card>
      </div>
    );
  }

  // Si no hay sesión, se muestra el formulario de autenticación
  return (
    <div className="min-h-screen bg-black-50 bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-8">
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </h1>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "El correo electrónico es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
              className="mt-1"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
              className="mt-1"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRegistering ? "Registrando..." : "Iniciando sesión..."}
              </>
            ) : (
              isRegistering ? "Registrarse" : "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* <p className="text-center mt-4">
          {isRegistering ? "¿Ya tienes una cuenta? " : "¿No tienes una cuenta? "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 underline"
          >
            {isRegistering ? "Inicia sesión" : "Regístrate"}
          </button>
        </p> */}
      </Card>
    </div>
  );
}
