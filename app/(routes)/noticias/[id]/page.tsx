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
                    .eq("id", id as string)
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
                    .eq("news_id", id as string)
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
        if (typeof id === 'string') {
            fetchNews();
            fetchComments();
        }

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
        news_id: Array.isArray(id) ? id[0] || "" : id || "",
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

    const handleShare = (social: string) => {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      const encodedUrl = encodeURIComponent(currentUrl);
      const title = encodeURIComponent(news?.title || '');
  
      const socialUrls = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
          whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}`
      };
  
      window.open(socialUrls[social as keyof typeof socialUrls], '_blank', 'noopener,noreferrer');
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
              .eq("news_id", id as string)
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
{/* Agregar esto después del div con className "flex justify-between items-center text-gray-600 mt-6" */}
<div className="mt-6 flex justify-end gap-4">
    <button
        onClick={() => handleShare('facebook')}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
        aria-label="Compartir en Facebook"
    >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    </button>
    
    <button
        onClick={() => handleShare('twitter')}
        className="p-2 rounded-full bg-blue-400 hover:bg-blue-500 transition-colors duration-300"
        aria-label="Compartir en Twitter"
    >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
    </button>
    
    <button
        onClick={() => handleShare('whatsapp')}
        className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-300"
        aria-label="Compartir en WhatsApp"
    >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    </button>
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
