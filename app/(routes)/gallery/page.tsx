"use client";
import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// Define las interfaces para las fotos y comentarios
interface Photo {
  id: number;
  url: string;
  likes: number;
  created_at?: string;
}

interface Comment {
  id: number;
  user_name: string;
  comment: string;
  photo_id: number;
}

const supabase = createClient();

export default function Gallery() {
  const [images, setImages] = useState<Photo[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Obtener un identificador único del usuario (simulado aquí usando localStorage)
  const getUserIdentifier = (): string => {
    // Verificar si estamos en el cliente
    if (typeof window === "undefined") return "";
  
    let identifier = localStorage.getItem("user_identifier");
    if (!identifier) {
      identifier = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("user_identifier", identifier);
    }
    return identifier;
  };

  const userIdentifier = getUserIdentifier();

  useEffect(() => {
    fetchImages();
  }, []);

  // Trae las imágenes desde la tabla "photos"
  async function fetchImages(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("id, url, likes, created_at");

      if (error) {
        console.error("Error al obtener imágenes:", error);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No se encontraron imágenes en la base de datos.");
        setImages([]);
        return;
      }

      // Transforma los datos para asegurar que sean de tipo Photo[]
      const formattedData: Photo[] = data.map((item) => ({
        id: item.id as number,
        url: item.url as string,
        likes: item.likes as number,
        created_at: item.created_at as string | undefined, // Opcional
      }));

      console.log("Imágenes obtenidas:", formattedData);
      setImages(formattedData);
    } catch (err) {
      console.error("Error inesperado al obtener imágenes:", err);
    }
  }

  // Verifica si el usuario ya ha dado like a una foto
  async function hasUserLiked(photoId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("photo_likes")
      .select("*")
      .eq("photo_id", photoId)
      .eq("user_identifier", userIdentifier);

    if (error) {
      console.error("Error al verificar likes:", error);
      return false;
    }

    return data.length > 0; // Si hay registros, el usuario ya dio like
  }

  // Actualiza el contador de likes en la tabla "photos" y en el estado local
  async function handleLike(photoId: number): Promise<void> {
    const hasLiked = await hasUserLiked(photoId);
    if (hasLiked) {
      alert("Ya has dado like a esta imagen.");
      return;
    }

    setImages((prev) =>
      prev.map((img) =>
        img.id === photoId ? { ...img, likes: (img.likes || 0) + 1 } : img
      )
    );

    const { error } = await supabase
      .from("photos")
      .update({ likes: (images.find((img) => img.id === photoId)?.likes || 0) + 1 })
      .eq("id", photoId);

    if (error) {
      console.error("Error actualizando likes:", error);
      return;
    }

    // Registrar el like en la tabla photo_likes
    const { error: likeError } = await supabase.from("photo_likes").insert({
      photo_id: photoId,
      user_identifier: userIdentifier,
    });

    if (likeError) {
      console.error("Error al registrar el like:", likeError);
    }
  }

  // Inserta un comentario en la tabla "comments"
  async function handleComment(photoId: number): Promise<void> {
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ photo_id: photoId, user_name: "Anónimo", comment: newComment }])
      .select("*");

    if (error) {
      console.error("Error al insertar comentario:", error);
      return;
    }

    if (data) {
      // Transforma los datos para asegurar que sean de tipo Comment[]
      const formattedData: Comment[] = data.map((item) => ({
        id: item.id as number,
        user_name: item.user_name as string,
        comment: item.comment as string,
        photo_id: item.photo_id as number,
      }));

      setNewComment("");
      setComments((prev) => ({
        ...prev,
        [photoId]: [...(prev[photoId] || []), ...formattedData],
      }));
    }
  }

  // Trae los comentarios de una foto específica
  async function fetchComments(photoId: number): Promise<void> {
    const { data, error } = await supabase
      .from("comments")
      .select("id, user_name, comment, photo_id")
      .eq("photo_id", photoId);

    if (error) {
      console.error("Error al obtener comentarios:", error);
      return;
    }

    if (data) {
      // Transforma los datos para asegurar que sean de tipo Comment[]
      const formattedData: Comment[] = data.map((item) => ({
        id: item.id as number,
        user_name: item.user_name as string,
        comment: item.comment as string,
        photo_id: item.photo_id as number,
      }));

      setComments((prev) => ({ ...prev, [photoId]: formattedData }));
    }
  }

  return (
    <div className="container mx-auto p-6">
  {images.length === 0 ? (
    <p className="text-center text-gray-500 text-lg">No se encontraron imágenes</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="relative aspect-square">
            <Image
              src={image.url}
              alt="Gallery Image"
              width={400}
              height={700}
              className="w-full h-max object-cover transform transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60">
            <div className="flex justify-between items-center space-x-2">
              <button
                onClick={() => handleLike(image.id)}
                className="flex items-center space-x-1 bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm transition-all duration-300"
              >
                <span>❤️</span>
                <span>{image.likes || 0}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedImage(image.id);
                  if (!comments[image.id]) {
                    fetchComments(image.id);
                  }
                }}
                className="bg-white/90 hover:bg-white text-blue-600 p-2 rounded-full shadow-sm transition-all duration-300"
              >
                💬
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
  
  {/* Sección de comentarios (manteniendo mejoras de estilo) */}
  {selectedImage !== null && (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Comentarios</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {comments[selectedImage]?.length ? (
          comments[selectedImage].map((c) => (
            <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-600">{c.user_name}</p>
              <p className="text-gray-600 mt-1">{c.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Sé el primero en comentar</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => selectedImage && handleComment(selectedImage)}
          className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-300 ${
            !newComment.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!newComment.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  )}
</div>
  );
}