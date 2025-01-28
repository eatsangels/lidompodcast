import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function EventosPage() {
  const events = [
    {
      title: "Día Familiar LidomPodcastShow",
      date: "30 de Marzo, 2024",
      time: "10:00 AM - 6:00 PM",
      location: "Estadio Quisqueya Juan Marichal",
      description: "Una jornada llena de actividades para toda la familia",
    },
    {
      title: "Clínica de Béisbol",
      date: "6 de Abril, 2024",
      time: "9:00 AM - 1:00 PM",
      location: "Campo de Entrenamiento LidomPodcastShow",
      description: "Aprende de los mejores jugadores y entrenadores",
    },
    {
      title: "Torneo Infantil",
      date: "13-14 de Abril, 2024",
      time: "Todo el día",
      location: "Complejo Deportivo LidomPodcastShow",
      description: "Competencia para equipos infantiles",
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
              Eventos Especiales
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Actividades y eventos para toda la familia tigueña
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {events.map((event) => (
            <Card key={event.title} className="overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    {event.location}
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-900 text-white hover:bg-blue-800">
                  Registrarse
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              No te pierdas ningún evento
            </h2>
            <p className="text-blue-100 mb-8">
              Suscríbete a nuestro boletín para recibir información sobre próximos eventos
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-1 rounded-md px-4 py-2"
                />
                <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}