"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import EditNewsModal from "./EditNewsModal";
import * as FingerprintJS from "@fingerprintjs/fingerprintjs";

const supabase = createClient();

export default function NewsDetailPage() {
    const { id } = useParams();
    interface News {
        id: string;
        title: string;
        content: string;
        image_url: string;
        video_url?: string;
        created_at: string;
        category: string;
    }
    
    const [news, setNews] = useState<News | null>(null);
    interface Comment {
        id: string;
        user_name: string;
        comment: string;
        created_at: string;
        likes: number;
        
    }

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [userName, setUserName] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    // Corregir la definición del estado error
    const [error, setError] = useState<string | null>(null); // <-- Aquí está el cambio
    const router = useRouter();
    const commentRef = useRef(null);
    const commentInputRef = useRef(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);


    useEffect(() => {
      // get visitor ID
        const getVisitorId = async () => {
        try{
          const fpPromise = FingerprintJS.load();
          const fp = await fpPromise;
          const result = await fp.get();
         setVisitorId(result.visitorId)

        }catch (e){
          console.log('Error getting the fingerprint', e)
          setError('Error trying to get fingerprint')
        }
      };

      getVisitorId()

        const fetchNews = async () => {
          setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("news")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) {
                  console.error("Error fetching news:", error);
                   setError('Error fetching news. Please try again.')
                } else {
                    setNews(data as unknown as News);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                 setError("Unexpected error. Please try again.")
            } finally {
              setLoading(false)
            }
        };

        const fetchComments = async () => {
             setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("comments")
                    .select("*")
                    .eq("news_id", id)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching comments:", error);
                    setError('Error fetching comments. Please try again.')

                } else {
                    setComments(data.map((item) => ({
                        id: item.id as string,
                        user_name: item.user_name as string,
                        comment: item.comment as string,
                        created_at: item.created_at as string,
                        likes: item.likes as number,
                    })));
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                setError("Unexpected error. Please try again.")
            } finally {
             setLoading(false)
           }
        };

      if (id) {
        fetchNews();
           fetchComments();

        const hash = window.location.hash;
             if (hash) {
               const commentId = hash.substring(1);
                   const element = document.getElementById(commentId);
                 if(element) {
                    element.scrollIntoView({behavior: 'smooth'})
                 }
           }
         }

    }, [id]);

    interface CommentData {
      news_id: string;
      user_name: string;
      comment: string;
    }

    const handleCommentSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (newComment.trim() === "" || userName.trim() === "") {
        alert("Por favor ingresa tu nombre y comentario.");
        return;
      }

      const commentData: CommentData = {
        news_id: Array.isArray(id) ? id[0] : id,
        user_name: userName,
        comment: newComment,
      };

      const { error, data } = await supabase.from("comments").insert([commentData as unknown as Record<string, unknown>]).select().single();

      if (error) {
        console.error("Error adding comment:", error);
        setError("Error adding comment. Please try again.");
      } else {
        setComments([{
            id: data.id as string,
            user_name: data.user_name as string,
            comment: data.comment as string,
            created_at: data.created_at as string,
            likes: data.likes as number,
        }, ...comments]);
        setNewComment("");
        setUserName("");
        if (commentInputRef.current) {
          (commentInputRef.current as HTMLTextAreaElement).value = "";
          (commentInputRef.current as HTMLTextAreaElement).focus();
        }
      }
    };

    if (loading) {
        return <p className="text-center text-xl text-gray-500">Cargando...</p>;
    }

    if(error) {
      return <p className="text-center text-xl text-red-500">{error}</p>
    }

    if (!news) {
        return <p className="text-center text-xl text-gray-500">No se encontró la noticia.</p>;
    }

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const isYoutubeUrl = (url: string) => {
        try {
            const videoUrl = new URL(url);
            return (
                videoUrl.hostname.includes("youtube.com") ||
                videoUrl.hostname.includes("youtu.be")
            );
        } catch (e) {
            return false;
        }
    };

    const getYoutubeEmbedUrl = (url: string) => {
        try {
            const videoUrl = new URL(url);
            let videoId = "";
            if (videoUrl.hostname.includes("youtube.com")) {
                videoId = videoUrl.searchParams.get("v") || "";
            } else if (videoUrl.hostname.includes("youtu.be")) {
                videoId = videoUrl.pathname.slice(1);
            }
            return `https://www.youtube.com/embed/${videoId}`;
        } catch (e) {
            return "";
        }
    };

    const displayedContent = isExpanded
        ? news.content
        : news.content.slice(0, 300);
    const showReadMore = news.content.length > 300 && !isExpanded;

    const renderContent = () => {
        const contentToRender = isExpanded ? news.content : news.content.slice(0, 300);
        const paragraphs = contentToRender.split("\n");

        return paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg text-gray-800 mb-4 leading-relaxed">
                {paragraph}
            </p>
        ));
    }

    const handleOpenModal = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
    
        if (user) {
            setIsModalOpen(true);
        } else {
            alert("Debes iniciar sesión para editar la noticia.");
            router.push("/admin/login"); // Redirige a la página de inicio de sesión
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEditSuccess = async () => {
      handleCloseModal();
      router.refresh();
      //re-fetch comments after a successful edit
      try {
          const { data, error } = await supabase
              .from("comments")
              .select("*")
              .eq("news_id", id)
              .order("created_at", { ascending: false });

          if (error) {
              console.error("Error fetching comments:", error);
               setError('Error fetching comments. Please try again.')
          } else {
              setComments(data.map((item) => ({
                  id: item.id as string,
                  user_name: item.user_name as string,
                  comment: item.comment as string,
                  created_at: item.created_at as string,
                  likes: item.likes as number,
              })));
          }
      } catch (err) {
           console.error("Unexpected error:", err);
             setError("Unexpected error. Please try again.")
      }

    }


  const handleLike = async (comment: Comment) => {
    if(!visitorId) return; //if visitor Id is not generated it should not like

      const likedKey = `liked_comment_${comment.id}_${visitorId}`;
      const hasLiked = localStorage.getItem(likedKey);

       if(hasLiked){
         return;
       }

    const { error } = await supabase
        .from("comments")
          .update({ likes: comment.likes + 1 })
        .eq("id", comment.id)

       if(error) {
         console.error("Error adding like:", error);
         setError("Error adding like. Please try again.")
       } else {
          setComments(comments.map((c) => c.id === comment.id ? {...c, likes: c.likes + 1} : c))
          localStorage.setItem(likedKey, 'true');
       }
  };


    return (
        <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-red-900 to-indigo-600 rounded-xl shadow-2xl mt-10 transform transition-all duration-500 hover:scale-105">
            <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight shadow-md">
                {news.title}
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">

                <div className="relative mb-4 flex justify-center">
                    <img
                        src={news.image_url}
                        alt={news.title}
                        className="w-1/2 h-auto rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:rotate-2"
                    />
                </div>
                {renderContent()}
                {showReadMore && (
                    <span className="text-gray-500">...</span>
                )}

                {news.video_url && isYoutubeUrl(news.video_url) && (
                    <div className="relative mb-4 flex justify-center">
                        <iframe
                            width="560"
                            height="315"
                            src={getYoutubeEmbedUrl(news.video_url)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:rotate-2"
                        ></iframe>
                    </div>
                )}

                <div className="flex justify-between items-center text-gray-600 mt-6">
                    <span className="text-sm text-gray-400">
                        {new Date(news.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                       {showReadMore && (
                         <button
                           onClick={toggleExpand}
                           className="text-sm text-blue-500 font-semibold hover:underline transition-colors duration-300"
                         >
                           Leer más
                         </button>
                       )}
                       {!showReadMore && isExpanded && (
                         <button
                           onClick={toggleExpand}
                           className="text-sm text-blue-500 font-semibold hover:underline transition-colors duration-300"
                         >
                           Leer menos
                         </button>
                       )}
                       <button
                          onClick={handleOpenModal}
                         className="text-sm text-yellow-500 font-semibold hover:underline transition-colors duration-300"
                       >
                         Editar
                       </button>
                    </div>
                </div>
            </div>

              <EditNewsModal
               isOpen={isModalOpen}
               onClose={handleCloseModal}
               news={news}
               onEditSuccess={handleEditSuccess}
                />

            <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Comentarios</h2>

              <div className="mb-6">
                    <input
                      ref={commentRef}
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
                    ></textarea>
                    <button
                        onClick={handleCommentSubmit}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                        Enviar comentario
                    </button>
                </div>
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} id={comment.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                              <p className="text-sm font-semibold text-gray-600">{comment.user_name}</p>
                            <p className="text-gray-700">{comment.comment}</p>
                            <div className='flex items-center justify-between mt-2'>
                            <span className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleString()}
                            </span>

                             <button
                                onClick={() => handleLike(comment)}
                                className="text-xs text-blue-500 font-semibold hover:underline transition-colors duration-300"
                               >
                                  { comment.likes > 0 ? `👍 ${comment.likes}` :  '👍 Me gusta' }
                             </button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}