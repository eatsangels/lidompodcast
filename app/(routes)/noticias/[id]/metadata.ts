import { createClient } from "@/lib/supabase/client";
import { Metadata } from "next";

// Definir la interfaz para el tipo News
interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  // Agrega otros campos necesarios
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  
  try {
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .eq("id", params.id)
      .single<News>(); // Especificar el tipo genérico

    if (!news) {
      return {
        title: "Noticia no encontrada | Lidom Podcast Show",
        description: "La noticia que buscas no está disponible",
      };
    }

    // Asegurar que content sea string y manejar posibles undefined
    const description = news.content?.substring(0, 160) ?? 'Descripción no disponible';
    
    return {
      title: `${news.title} | Lidom Podcast Show`,
      description: description,
      openGraph: {
        title: news.title,
        description: description,
        images: [news.image_url || '/default-image.jpg'], // Fallback para imagen
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: news.title,
        description: description,
        images: [news.image_url || '/default-image.jpg'], // Fallback para imagen
      },
    };
  } catch (error) {
    console.error("Error fetching news metadata:", error);
    return {
      title: "Error | Lidom Podcast Show",
      description: "Ocurrió un error al cargar la noticia",
    };
  }
}