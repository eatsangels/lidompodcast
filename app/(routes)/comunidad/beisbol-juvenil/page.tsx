import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baseline as Baseball, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

export default function BeisbolJuvenilPage() {
  const programs = [
    {
      title: "Liga Infantil",
      age: "8-12 años",
      schedule: "Sábados 9:00 AM - 12:00 PM",
      location: "Campo de Entrenamiento Licey",
    },
    {
      title: "Liga Juvenil",
      age: "13-15 años",
      schedule: "Sábados 2:00 PM - 5:00 PM",
      location: "Campo de Entrenamiento Licey",
    },
    {
      title: "Academia de Pitcheo",
      age: "10-15 años",
      schedule: "Domingos 9:00 AM - 11:00 AM",
      location: "Campo de Entrenamiento Licey",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587542177509-573b5aeb557f')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Béisbol Juvenil
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Formando los futuros talentos del béisbol dominicano
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
                  <Baseball className="h-6 w-6 text-blue-900" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    Edad: {program.age}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    {program.schedule}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    {program.location}
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-900 text-white hover:bg-blue-800">
                  Inscribirse
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Beneficios del Programa
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Entrenadores Profesionales
              </h3>
              <p className="text-blue-100">
                Instructores con experiencia en ligas profesionales
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Instalaciones de Primera
              </h3>
              <p className="text-blue-100">
                Campos e instalaciones de nivel profesional
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Desarrollo Integral
              </h3>
              <p className="text-blue-100">
                Formación deportiva y valores personales
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Competencias
              </h3>
              <p className="text-blue-100">
                Participación en torneos y ligas juveniles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}