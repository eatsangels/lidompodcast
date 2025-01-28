import { Card } from "@/components/ui/card";
import { Users, Mail, Phone } from "lucide-react";

export default function DirectivosPage() {
  const directivos = [
    {
      name: "Joan Fermín",
      position: "CEO y creador de la compañía JF Creator Company",
      image: "/images/Joan_Fermin.png",
      email: "joannegocios06@gmail.com",
      phone: "(829) 959-0434",
    },
    {
      name: "Jonathan Chal Nuñez",
      position: "Vicepresidente",
      image: "/images/JhonathanChal.png",
      email: "joannegocios06@gmail.com",
      phone: "(829) 959-0434",
    },
    {
      name: "Edward Trinidad",
      position: "Web Developer",
      image: "/images/Edward_Trinidad.png",
      email: "alexandertrinidad@gmail.com",
      phone: "(829) 959-0434",
    },
  ];

  const departments = [
    {
      name: "Operaciones",
      director: "Juan Pérez",
      responsibilities: ["Logística de juegos", "Mantenimiento de instalaciones", "Seguridad"],
    },
    {
      name: "Marketing",
      director: "Ana García",
      responsibilities: ["Promociones", "Redes sociales", "Relaciones públicas"],
    },
    {
      name: "Deportivo",
      director: "Luis Martínez",
      responsibilities: ["Desarrollo de talento", "Scouting", "Preparación física"],
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
              Directivos.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Conoce al equipo que lidera Lidom Podcast Show
            </p>
          </div>
        </div>
      </div>

      {/* Directivos Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {directivos.map((directivo) => (
            <Card key={directivo.name} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={directivo.image}
                  alt={directivo.name}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900">{directivo.name}</h3>
                <p className="mt-1 text-gray-600">{directivo.position}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    {directivo.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    {directivo.phone}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Departments Section */}
      {/* <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Departamentos</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {departments.map((dept) => (
              <div key={dept.name} className="rounded-lg bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
                <p className="mt-2 text-blue-100">Director: {dept.director}</p>
                <ul className="mt-4 space-y-2">
                  {dept.responsibilities.map((resp) => (
                    <li key={resp} className="flex items-center text-blue-100">
                      <Users className="h-4 w-4 mr-2" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
}