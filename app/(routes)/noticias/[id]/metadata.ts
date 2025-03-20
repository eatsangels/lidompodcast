import { createClient } from "@/lib/supabase/client";
import { Metadata } from "next";

// Definir la interfaz para el tipo News
interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lidompodcast.com";

  try {
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .eq("id", params.id)
      .single<News>();

    if (!news) {
      return {
        title: "Noticia no encontrada | Lidom Podcast Show",
        description: "La noticia que buscas no está disponible",
      };
    }

    const description = news.content?.substring(0, 160) ?? "Descripción no disponible";
    const imageUrl = news.image_url ? (news.image_url.startsWith("http") ? news.image_url : `${siteUrl}${news.image_url}`) : `${siteUrl}/default-image.jpg`;

    return {
      title: `${news.title} | Lidom Podcast Show`,
      description: description,
      openGraph: {
        title: news.title,
        description: description,
        url: `${siteUrl}/noticia/${params.id}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: news.title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: news.title,
        description: description,
        images: [imageUrl],
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
