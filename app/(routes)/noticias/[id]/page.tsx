"use client"; // Marca el componente como Client Component

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation"; // Usamos useParams en vez de useRouter

export default function NewsDetailPage() {
  const { id } = useParams(); // Recuperamos el id de la noticia
  const [news, setNews] = useState(null);
  const [comments, setComments] = useState([]); // Estado para los comentarios
  const [newComment, setNewComment] = useState(""); // Estado para el nuevo comentario
  const [userName, setUserName] = useState(""); // Estado para el nombre de usuario
  const supabase = createClient();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching news:", error);
        } else {
          setNews(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("news_id", id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching comments:", error);
        } else {
          setComments(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    if (id) {
      fetchNews();
      fetchComments();
    }
  }, [id, supabase]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (newComment.trim() === "" || userName.trim() === "") {
      alert("Por favor ingresa tu nombre y comentario.");
      return;
    }

    const { error } = await supabase.from("comments").insert([
      {
        news_id: id,
        user_name: userName,
        comment: newComment,
      },
    ]);

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      // Una vez que se agrega el comentario, actualizamos la lista de comentarios
      setComments([{
        user_name: userName,
        comment: newComment,
        created_at: new Date().toISOString(),
      }, ...comments]);
      setNewComment("");
      setUserName("");
    }
  };

  if (!news) {
    return <p className="text-center text-xl text-gray-500">Cargando...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-2xl mt-10 transform transition-all duration-500 hover:scale-105">
      <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight shadow-md">{news.title}</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <p className="text-lg text-gray-800 mb-4 leading-relaxed">{news.content}</p>

        <div className="relative mb-6">
          <img 
            src={news.image_url} 
            alt={news.title} 
            className="w-full h-auto rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:rotate-2"
          />
        </div>

        <div className="flex justify-between items-center text-gray-600 mt-6">
          <span className="text-sm text-gray-400">{new Date(news.created_at).toLocaleDateString()}</span>
          <button className="text-sm text-blue-500 font-semibold hover:underline transition-colors duration-300">Leer más</button>
        </div>
      </div>

      {/* Sección de Comentarios */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Comentarios</h2>

        <div className="mb-6">
          <input 
            type="text" 
            className="w-full p-4 mb-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600" 
            placeholder="Tu nombre..." 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
          />
          <textarea 
            className="w-full p-4 mb-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600" 
            placeholder="Deja tu comentario..." 
            rows={4} 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button 
            onClick={handleCommentSubmit}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Enviar comentario
          </button>
        </div>

        {/* Mostrar los comentarios */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold text-gray-600">{comment.user_name}</p>
              <p className="text-gray-700">{comment.comment}</p>
              <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
