"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Video, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NewsFormData = {
  title: string;
  content: string;
  image_url: string;
  video_url?: string;
  category: string;
};

export default function AdminNewsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsFormData>();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.push("/admin/login");
      }
    };
    checkAuth();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("news")
        .insert([
          {
            title: data.title,
            content: data.content,
            image_url: data.image_url,
            video_url: data.video_url,
            category: data.category,
          },
        ]);

      if (error) throw error;
      reset();
      alert("Noticia publicada exitosamente");
    } catch (error) {
      console.error("Error al publicar la noticia:", error);
      alert("Error al publicar la noticia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-gray-50 p-8">
      <div className="max-w-4xl  mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Administrar Noticias</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title", { required: "El título es requerido" })} placeholder="Ingrese el título de la noticia" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <select id="category" {...register("category", { required: "La categoría es requerida" })} className="w-full rounded-md border border-gray-300 p-2">
                <option value="">Seleccione una categoría</option>
                <option value="equipo">Equipo</option>
                <option value="jugadores">Jugadores</option>
                <option value="partidos">Partidos</option>
                <option value="fanaticos">Fanáticos</option>
                <option value="lidom">Lidom</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="content">Contenido</Label>
              <Textarea id="content" {...register("content", { required: "El contenido es requerido" })} placeholder="Escriba el contenido de la noticia" />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <Label htmlFor="image_url">URL de la Imagen</Label>
              <div className="flex gap-2">
                <Input id="image_url" {...register("image_url", { required: "La imagen es requerida" })} placeholder="https://ejemplo.com/imagen.jpg" />
                <Button type="button" variant="outline">
                  <Image className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
              {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
            </div>

            <div>
              <Label htmlFor="video_url">URL del Video (opcional)</Label>
              <div className="flex gap-2">
                <Input id="video_url" {...register("video_url")} placeholder="https://youtube.com/watch?v=..." />
                <Button type="button" variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Publicar Noticia"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}