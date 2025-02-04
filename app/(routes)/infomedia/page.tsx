import { Newspaper, Radio, Podcast, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { link } from "node:fs";


export default function InfoMediaPage() {
  

  const mediaTypes = [
    {
      title: "Noticias",
      icon: Newspaper,
      description: "Últimas noticias y actualizaciones del equipo y mucho más",
      link: "/noticias",
      
    },
    {
      title: "Radio",
      icon: Radio,
      description: "Transmisiones en vivo y programas de radio",
      link: "/",
    },
    {
      title: "Podcast",
      icon: Podcast,
      description: "Análisis y entrevistas en profundidad",
      link: "/multimedia",
    },
    {
      title: "Videos",
      icon: Video,
      description: "Highlights y contenido exclusivo",
      link: "/multimedia",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/Fondo.jpg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              InfoMedia
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Mantente informado con las últimas noticias y contenido multimedia
            </p>
          </div>
        </div>
      </div>

      {/* Media Types Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {mediaTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.title} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Icon className="h-12 w-12 text-blue-900" />
                  <h3 className="mt-4 text-xl font-semibold">{type.title}</h3>
                  <p className="mt-2 text-gray-600">{type.description}</p>
                  <Button asChild className="mt-4 bg-blue-900 text-white hover:bg-blue-800">
                    <Link href={type.link}>Más Información</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

     
    </div>
  );
}