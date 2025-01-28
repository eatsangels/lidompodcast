import { Trophy, Award, Star, MicVocal  } from "lucide-react";

export default function HistoriaPage() {
  const achievements = [
    {
      year: "2022 - Fundación",
      title: "Fundación",
      description: " 'LIDOM El Podcast' nació durante la temporada 2022-2023 de la Liga Invernal de Béisbol Profesional de la República Dominicana, una de las competiciones más apasionantes y tradicionales del béisbol en el Caribe. Desde su creación, este podcast ha logrado capturar la atención de una amplia fanaticada que sigue de cerca los acontecimientos, análisis y emociones que rodean la liga.    ",
    },
    {
      year: "2025",
      title: "Llegamos a 90,000 suscriptores",
      description: "LIDOM El Podcast alcanzó la impresionante cifra de 90,000 suscriptores, consolidándose como una referencia clave para los fanáticos del béisbol invernal dominicano. Este logro refleja el compromiso del equipo detrás del podcast en brindar contenido de calidad, análisis detallado y una conexión auténtica con su audiencia.",
    },
    

    
  ];

  const championships = [
    {
      year: "Fundador",
      opponent: "Dirigido por Joan Fermín, CEO y creador de la compañía JF Creator Company, y Jonathan Chal Núñez, ambos hermanos y creadores de contenido, el podcast refleja no solo su amor por el béisbol, sino también su compromiso con brindar información entretenida y de calidad a los fanáticos. La conexión entre ambos y su origen en una familia humilde han sido pilares fundamentales en el éxito del proyecto, destacando valores como la perseverancia, la pasión y la unidad familiar.", 
      
    },

    
    
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/LP.jpg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Nuestra Historia
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Lidom Podcast Show, el espacio donde discutimos todo sobre la Liga de Béisbol Profesional de la República Dominicana (LIDOM).
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">Momentos Históricos de LIDOM El Podcast</h2>
            <div className="mt-8 space-y-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-blue-900"
                >
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-900" />
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="font-bold text-blue-900">{achievement.year}</div>
                    <h3 className="mt-2 text-xl font-semibold">{achievement.title}</h3>
                    <p className="mt-2 text-gray-900">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-blue-900">Un poco de Historia.</h2>
            <div className="mt-8 space-y-6">
              {championships.map((championship, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg bg-blue-700 p-6 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white-500">CEO</div>
                      <div className="text-xl font-bold text-blue-900">
                        {championship.year}
                      </div>
                    </div>
                    <MicVocal className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="mt-4">
                    
                    <div className="font-semibold">{championship.opponent}</div>
                    
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
              <div className="mt-4 text-4xl font-bold text-white">24</div>
              <div className="mt-2 text-blue-100">Campeonatos Nacionales</div>
            </div>
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-yellow-400" />
              <div className="mt-4 text-4xl font-bold text-white">11</div>
              <div className="mt-2 text-blue-100">Series del Caribe</div>
            </div>
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <Star className="mx-auto h-12 w-12 text-yellow-400" />
              <div className="mt-4 text-4xl font-bold text-white">117</div>
              <div className="mt-2 text-blue-100">Años de Historia</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}