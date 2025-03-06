import { ImageResponse } from "@vercel/og";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Lidom Podcast Show - Noticias";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  
  try {
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!news) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 60,
              color: "white",
              background: "linear-gradient(to right, #1e3a8a, #1e40af)",
              width: "100%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 40, opacity: 0.8 }}>Lidom Podcast Show</div>
            <div style={{ marginTop: 20 }}>Noticia no encontrada</div>
          </div>
        ),
        { ...size }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "white",
            background: "linear-gradient(to right, #1e3a8a, #1e40af)",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 40,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${news.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.4,
            }}
          />
          <div style={{ fontSize: 40, opacity: 0.8, zIndex: 10 }}>Lidom Podcast Show</div>
          <div style={{ marginTop: 20, maxWidth: "80%", zIndex: 10 }}>{news.title}</div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "white",
            background: "linear-gradient(to right, #1e3a8a, #1e40af)",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: 40,
          }}
        >
          <div style={{ fontSize: 40, opacity: 0.8 }}>Lidom Podcast Show</div>
          <div style={{ marginTop: 20 }}>Error al cargar la noticia</div>
        </div>
      ),
      { ...size }
    );
  }
}