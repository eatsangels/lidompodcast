import { Metadata, ResolvingMetadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient();
  
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return {
        title: "Noticia no encontrada | Lidom Podcast Show",
        description: "La noticia que buscas no está disponible",
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
      };
    }

    return {
      title: `${data.title} | Lidom Podcast Show`,
      description: data.content.substring(0, 160),
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
      openGraph: {
        title: data.title,
        description: data.content.substring(0, 160),
        images: [data.image_url],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.content.substring(0, 160),
        images: [data.image_url],
      },
    };
  } catch (error) {
    console.error("Error fetching news metadata:", error);
    return {
      title: "Error | Lidom Podcast Show",
      description: "Ocurrió un error al cargar la noticia",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    };
  }
}

export default function NewsLayout({ children }: Props) {
  return <>{children}</>;
}