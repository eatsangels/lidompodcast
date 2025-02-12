"use client";

import { Video, Image as ImageIcon, Play, Radio, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function MultimediaPage() {
  const [activeImage, setActiveImage] = useState(0);

  const videos = [
    {
      id: "video1",
      title: "Tigres Del Licey Vs Leones Del Escogido l Resumen De Serie Final 2024-2025",
      description: "Resumen de la serie final del campeonato nacional de la Lidom.",
      embedUrl: "https://www.youtube.com/embed/WRgSm1nLM48?si=1lf1BNRR2tD3kdDN",
      date: "27 de Enero, 2025",
    },
    {
      id: "video2",
      title: "Junior Caminero EXPLOTA con un Jonrón de 411 Pies Contra Jairo Asencio en la Serie Finalsta con el Manager",
      description: "Caminero Conecta HR por los 411",
      embedUrl: "https://www.youtube.com/embed/gmrH1z5nWNU?si=COKRrJILB5dRq_I9",
      date: "27 de Enero, 2025",
    },
    {
      id: "video3",
      title: "LICEY VS ESCOGIDO  Jonathan ANUNCIA al Posible GANADOR de la Serie Final: Licey vs Escogido",
      description: "Un solo ganador!!",
      embedUrl: "https://www.youtube.com/embed/y9Ly_xTmX_c?si=I3wDf3HTxZIuq-EP",
      date: "19 ene 2025  ",
    },
  ];

  const galleries = [
    {
      title: "Celebración del Campeonato 2025",
      image: "/images/LeonesCampeon.png",
      description: "Los Leoenes celebran su victoria en el campeonato nacional",
    },
    {
      title: "Dugouts del Escodigo",
      image: "https://hoy.com.do/wp-content/uploads/2025/01/IMG-20250127-WA0062-scaled.jpg?x86501",
      description: "Serie Final de la Liga de Béisbol Profesional de la República Dominicana",
    },
    {
      title: "Junior Caminero",
      image: "https://resources.diariolibre.com/images/2025/01/28/17--escogido-campeon-2024-2025-felix-leon.jpg",
      description: "HR 411 de Junior Caminero",
    },
    {
      title: "Jugadas Destacadas",
      image: "https://pbs.twimg.com/media/GiWXrRoaUAAVZjJ.jpg",
      description: "Momentos memorables de la temporada",
    },
    {
      title: "Presidente de la República Dominicana Felicita a los Leones",
      image: "https://www.eyr.com.do/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-27-at-11.57.28-PM.jpeg",
      description: "Luis Abinader felicita a los Leones del Escogido",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24 shadow-xl shadow-blue-400">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/LP.jpg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Visita nuestros canales de YouTube
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Disfruta del mejor contenido audiovisual de los Lidom Podcast Show
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="live">En Vivo</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-8">
            <div className="grid gap-8 md:grid-cols-3">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      className="h-full w-full"
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-blue-900">{video.title}</h3>
                    <p className="mt-2 text-gray-600">{video.description}</p>
                    <div className="mt-4 text-sm text-gray-500">{video.date}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-8">
  <Card className="overflow-hidden">
    <div className="aspect-video w-full">
      <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/07NSq4J_Jic?si=dZcXjhSmd52gag1d"
        title="Transmisión en Vivo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </Card>
</TabsContent>

          <TabsContent value="gallery" className="mt-8">
            <div className="space-y-8">
              {/* Main Carousel */}
              <Carousel className="w-full max-w-5xl mx-auto">
                <CarouselContent>
                  {galleries.map((gallery, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-[16/9]">
                        <img
                          src={gallery.image}
                          alt={gallery.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 rounded-lg" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{gallery.title}</h3>
                          <p className="text-lg text-gray-200">{gallery.description}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-4 px-4">
                {galleries.map((gallery, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 ${
                      activeImage === index
                        ? "ring-4 ring-blue-500 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <div className="aspect-[4/3]">
                      <img
                        src={gallery.image}
                        alt={gallery.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}