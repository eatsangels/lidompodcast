"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Video, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NewsFormData = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  video_url?: string;
  category: string;
};

type EditNewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  news: NewsFormData;
  onEditSuccess: () => void;
};

export default function EditNewsModal({ isOpen, onClose, news, onEditSuccess }: EditNewsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<NewsFormData>();
  const supabase = createClient();

  useEffect(() => {
    if (news) {
      setValue('title', news.title);
      setValue('content', news.content);
      setValue('image_url', news.image_url);
      setValue('video_url', news.video_url || '');
      setValue('category', news.category);
    }
  }, [news, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: NewsFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("news")
        .update({
          title: data.title,
          content: data.content,
          image_url: data.image_url,
          video_url: embedUrl || data.video_url,
          category: data.category,
        })
        .eq("id", news.id);

      if (error) throw error;
      reset();
      setEmbedUrl(null);
      onEditSuccess();
      alert("Noticia editada exitosamente");
    } catch (error) {
      console.error("Error al editar la noticia:", error);
      alert("Error al editar la noticia");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const embedUrl = convertYouTubeUrl(url);
    setEmbedUrl(embedUrl);
  };

  const convertYouTubeUrl = (url: string) => {
    if (!url) return null;

    const regExpEmbed = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?\/\s]+)$/;
    const regExpWatch = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)([^"&?\/\s]+)$/;
    const regExpShort = /^(?:https?:\/\/)?youtu\.be\/([^"&?\/\s]+)$/;

    let match = url.match(regExpEmbed);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    match = url.match(regExpWatch);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    match = url.match(regExpShort);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative p-4 w-full max-w-4xl h-full md:h-auto mx-auto mt-20">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Noticia
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  {...register("title", { required: "El título es requerido" })}
                  placeholder="Ingrese el título de la noticia"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  {...register("category", { required: "La categoría es requerida" })}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="">Seleccione una categoría</option>
                  <option value="equipo">Equipo</option>
                  <option value="jugadores">Jugadores</option>
                  <option value="partidos">Partidos</option>
                  <option value="fanaticos">Fanáticos</option>
                  <option value="lidom">Lidom</option>
                  <option value="MLB">MLB</option>
                </select>
              </div>

              <div>
                <Label htmlFor="image_url">URL de la Imagen</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    {...register("image_url", { required: "La imagen es requerida" })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Image className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="video_url">URL del Video (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="video_url"
                    {...register("video_url")}
                    placeholder="https://youtube.com/watch?v=..."
                    onChange={handleVideoChange}
                  />
                  <Button type="button" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
                {embedUrl && (
                  <div className="mt-4">
                    <iframe
                      width="100%"
                      height="400"
                      src={embedUrl}
                      title="Vista previa del video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "El contenido es requerido" })}
                  placeholder="Escriba el contenido de la noticia"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}