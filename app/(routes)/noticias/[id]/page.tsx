'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const EditNewsModal = dynamic(() => import("./EditNewsModal"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  ),
  ssr: false,
});

interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  video_url?: string;
  created_at: string;
  category: string;
}

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  created_at: string;
  likes: number;
}

interface CommentData {
  news_id: string;
  user_name: string;
  comment: string;
}

export default function NewsDetailPage() {
  const { id } = useParams() as { id: string };
  const supabase = useMemo(() => createClient(), []);
  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const abortController = new AbortController();

    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setNews(data as unknown as News);

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("news_id", id)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;
        setComments(commentsData.map((item) => ({
          id: item.id as string,
          user_name: item.user_name as string,
          comment: item.comment as string,
          created_at: item.created_at as string,
          likes: (item.likes as number) ?? 0,
        })));
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching data:", err);
          setError("Error loading content. Please try again.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => abortController.abort();
  }, [id, supabase]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !newComment.trim() || !userName.trim()) {
      alert("Por favor ingresa tu nombre y comentario.");
      return;
    }

    const commentData: CommentData = {
      news_id: id,
      user_name: userName.trim(),
      comment: newComment.trim(),
    };

    try {
      const { error, data } = await supabase
      .from("comments")
      .insert(commentData as unknown as Record<string, unknown>) // ← Corrección aplicada
      .select()
      .single();

      if (error) throw error;

      setComments((prev) => [
        {
          id: data.id as string,
          user_name: data.user_name as string,
          comment: data.comment as string,
          created_at: data.created_at as string,
          likes: 0 as number,
        },
        ...prev,
      ]);
      
      setNewComment("");
      setUserName("");
      
      if (commentInputRef.current) {
        commentInputRef.current.value = "";
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Error adding comment. Please try again.");
    }
  };

  const handleShare = (social: string) => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const title = encodeURIComponent(news?.title || "");

    const socialUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}`,
    };

    const url = socialUrls[social];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenModal = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setIsModalOpen(true);
    } else {
      alert("Debes iniciar sesión para editar la noticia.");
      router.push("/admin/login");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditSuccess = async () => {
    handleCloseModal();
    router.refresh();
  };

  const handleLike = async (comment: Comment) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ likes: (comment.likes || 0) + 1 })
        .eq("id", comment.id);

      if (error) throw error;

      setComments(prev => prev.map((c) => 
        c.id === comment.id ? { ...c, likes: (c.likes || 0) + 1 } : c
      ));
    } catch (error) {
      console.error("Error adding like:", error);
      setError("Error adding like. Please try again.");
    }
  };

  const isYoutubeUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const videoUrl = new URL(url);
      return (
        videoUrl.hostname.includes("youtube.com") ||
        videoUrl.hostname.includes("youtu.be")
      );
    } catch {
      return false;
    }
  };

  const getYoutubeEmbedUrl = (url?: string): string => {
    if (!url) return "";
    try {
      const videoUrl = new URL(url);
      let videoId = "";

      if (videoUrl.hostname.includes("youtube.com")) {
        videoId = videoUrl.searchParams.get("v") || "";
      } else if (videoUrl.hostname.includes("youtu.be")) {
        videoId = videoUrl.pathname.slice(1);
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    } catch {
      return "";
    }
  };

  const renderContent = () => {
    if (!news?.content) return null;
    const contentToRender = isExpanded ? news.content : news.content.slice(0, 300);
    const paragraphs = contentToRender.split("\n").filter(Boolean);

    return paragraphs.map((paragraph, index) => (
      <p key={index} className="text-lg text-gray-800 mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => router.push("/noticias")}
            variant="link"
            className="text-blue-500 hover:text-blue-700"
          >
            Volver a noticias
          </Button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">No se encontró la noticia.</p>
          <Button 
            onClick={() => router.push("/noticias")}
            variant="link"
            className="text-blue-500 hover:text-blue-700"
          >
            Volver a noticias
          </Button>
        </div>
      </div>
    );
  }

  const showReadMore = (news.content?.length || 0) > 300 && !isExpanded;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-red-900 to-indigo-600 rounded-xl shadow-2xl mt-10 transform transition-all duration-500 hover:scale-105">
      <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight shadow-md">
        {news.title}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="relative mb-4 flex justify-center">
          {news.image_url && (
            <img
              src={news.image_url}
              alt={news.title}
              className="w-1/2 h-auto rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:rotate-2"
            />
          )}
        </div>

        {renderContent()}
        
        {showReadMore && <span className="text-gray-500">...</span>}

        {news.video_url && isYoutubeUrl(news.video_url) && (
          <div className="relative mb-4 flex justify-center">
            <iframe
              width="560"
              height="315"
              src={getYoutubeEmbedUrl(news.video_url)}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:rotate-2"
            />
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600 mt-6">
          <span className="text-sm text-gray-400">
            {new Date(news.created_at).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {showReadMore ? (
              <Button
                variant="link"
                onClick={() => setIsExpanded(true)}
                className="text-sm text-blue-500 font-semibold hover:text-blue-700"
              >
                Leer más
              </Button>
            ) : isExpanded ? (
              <Button
                variant="link"
                onClick={() => setIsExpanded(false)}
                className="text-sm text-blue-500 font-semibold hover:text-blue-700"
              >
                Leer menos
              </Button>
            ) : null}
            <Button
              variant="link"
              onClick={handleOpenModal}
              className="text-sm text-yellow-500 font-semibold hover:text-yellow-700"
            >
              Editar
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("facebook")}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Compartir en Facebook"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("twitter")}
          className="p-2 rounded-full bg-blue-400 hover:bg-blue-500 text-white"
          aria-label="Compartir en Twitter"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("whatsapp")}
          className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
          aria-label="Compartir en WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </Button>
      </div>

      {isModalOpen && (
        <EditNewsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          news={news}
          onEditSuccess={handleEditSuccess}
        />
      )}

      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Comentarios</h2>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <input
            type="text"
            className="w-full p-4 mb-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Tu nombre..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <textarea
            ref={commentInputRef}
            className="w-full p-4 mb-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Deja tu comentario..."
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            type="submit"
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Enviar comentario
          </Button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold text-gray-600">{comment.user_name}</p>
              <p className="text-gray-700">{comment.comment}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment)}
                  className="text-xs text-blue-500 font-semibold hover:text-blue-700"
                >
                  {comment.likes > 0 ? `👍 ${comment.likes}` : "👍 Me gusta"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}