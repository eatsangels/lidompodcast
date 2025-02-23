// app/noticias/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import NewsDetailPage from "@/components/NewsDetailPage";

// Corregir parámetros de generateMetadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params; // Params no es una Promise
  
  // Obtener cookies correctamente
  const cookieStore = await cookies();
  const supabase = createServerClient(); // Pasar cookieStore al cliente Supabase

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !news) {
    return {
      title: "Noticia",
      description: "No se pudo obtener la información de la noticia.",
      openGraph: {
        images: ["/default-news-image.jpg"],
      },
    };
  }

  return {
    title: news.title,
    description: news.summary || "",
    openGraph: {
      images: [news.image_url || "/default-news-image.jpg"],
    },
  };
}

// Componente principal corregido
export default async function Page({ params }: { params: { id: string } }) {
  // Obtener cookies y crear cliente Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient();
  
  // Obtener token de autenticación
  const token = cookieStore.get('sb-bivtimkghquvyhwlwbqm-auth-token');

  return <NewsDetailPage newsId={params.id} token={token} />;
}