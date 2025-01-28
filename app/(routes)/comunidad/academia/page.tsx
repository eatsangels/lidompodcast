import { Card } from "@/components/ui/card";
import { Trophy, Star, Users, Calendar } from "lucide-react";

export default function AcademiaPage() {
  const programs = [
    {
      title: "Programa Elite",
      description: "Desarrollo intensivo para prospectos de alto potencial",
      features: [
        "Entrenamiento personalizado",
        "Evaluación constante",
        "Preparación física avanzada",
      ],
    },
    {
      title: "Programa de Desarrollo",
      description: "Formación integral para jugadores en desarrollo",
      features: [
        "Fundamentos técnicos",
        "Preparación física básica",
        "Desarrollo mental",
      ],
    },
    {
      title: "Programa de Iniciación",
      description: "Introducción al béisbol profesional",
      features: [
        "Fundamentos básicos",
        "Introducción al juego",
        "Desarrollo motriz",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1471295253337-3ceaaad65897')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Academia Licey
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Formando las estrellas del mañana
            </p>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.title} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-blue-900">{program.title}</h3>
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <ul className="space-y-2">
                  {program.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-blue-900" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="mt-2 text-blue-100">Jugadores profesionales</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">15+</div>
              <div className="mt-2 text-blue-100">Años de experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">200+</div>
              <div className="mt-2 text-blue-100">Estudiantes activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">10+</div>
              <div className="mt-2 text-blue-100">Entrenadores profesionales</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}