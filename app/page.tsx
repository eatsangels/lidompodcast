import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Trophy, Calendar, Star, Users, MicVocal, Newspaper } from "lucide-react";
import Noticias from "@/app/(routes)/noticias/page";
import MultimediaPage from "./(routes)/multimedia/page";
import Standings from "@/components/Standings"; // Asegúrate de ajustar la ruta según tu estructura
import CountdownTimer from "@/components/CountdownTimer";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div
        className="relative h-[800px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/Fondo.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/90 to-blue-800/70 shadow-lg shadow-blue-400" />
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sección izquierda: Título y descripción */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Lidom Podcast Show
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                <MicVocal className="h-12 w-12 text-blue-200 mb-4" />
                Bienvenido a Lidom Podcast Show, el espacio donde discutimos todo sobre la Liga de
                Béisbol Profesional de la República Dominicana (LIDOM). Entérate de las últimas
                noticias, análisis y entrevistas exclusivas con los protagonistas del béisbol
                dominicano.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button asChild className="bg-blue-400 text-blue-900 hover:bg-yellow-500">
                  <Link href="/historia">
                    Nuestra Historia
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
              </div>
            </div>

            {/* Sección derecha: Standings */}
            <div className="flex justify-center items-start w-auto">
              <Standings />
            </div>
            
          </div>
          <CountdownTimer />
        </div>
      </div>

      {/* Comentado Stats Section */}
      {/* <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <Trophy className="h-12 w-12 text-blue-900 mb-4" />
              <h3 className="text-2xl font-bold text-blue-900">24</h3>
              <p className="text-blue-700">Campeonatos Nacionales</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <Star className="h-12 w-12 text-blue-900 mb-4" />
              <h3 className="text-2xl font-bold text-blue-900">11</h3>
              <p className="text-blue-700">Series del Caribe</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <Calendar className="h-12 w-12 text-blue-900 mb-4" />
              <h3 className="text-2xl font-bold text-blue-900">117</h3>
              <p className="text-blue-700">Años de Historia</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <Users className="h-12 w-12 text-blue-900 mb-4" />
              <h3 className="text-2xl font-bold text-blue-900">1M+</h3>
              <p className="text-blue-700">Fanáticos</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Latest News Section */}
      <div className="bg-gray-50 grid grid-cols-1 py-1"></div>

      <MultimediaPage />
      <Noticias />

      {/* Next Game Section */}
      {/* <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Próximo Juego
              </h2>
              <div className="mt-8 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <img
                      src="https://www.LidomPodcastShow.com/wp-content/themes/glorius-1071/img/logo_LidomPodcastShowpng.png"
                      alt="LidomPodcastShow"
                      className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <span className="text-white font-bold">LidomPodcastShow</span>
                  </div>
                  <div className="text-white text-4xl font-bold">VS</div>
                  <div className="text-center">
                    <img
                      src="https://www.escogido.com/wp-content/uploads/2023/10/Logo-Escogido-Rombo-Oficial-Web.png"
                      alt="Águilas"
                      className="w-30 h-20 rounded-full mx-auto mb-2"
                    />
                    <span className="text-white font-bold">Escogido</span>
                  </div>
                </div>
                <div className="text-white">
                  <p className="text-xl">Lunes, 21 de Enero, 2025</p>
                  <p className="text-lg">7:15 PM</p>
                  <p className="text-lg">Estadio Quisqueya Juan Marichal</p>
                </div>
                <Button asChild className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 mt-4">
                  <Link href="/tickets">
                    Comprar Boletos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Social Media Feed */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              #LidomPodcastShow en Redes Sociales
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Sigue nuestras redes sociales para mantenerte actualizado
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Social Media Cards will be populated here */}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
    </div>
  );
}