// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-red-500 text-white p-8">
      <h1 className="text-7xl font-extrabold mb-4 animate-bounce">404</h1>
      <p className="text-4xl mb-8 text-center text-black">
        ¡Ups! Parece que te perdiste en este universo digital.
        <br />
        La página que buscas se ha evaporado en el ciberespacio.
      </p>
      {/* Puedes agregar una imagen divertida si tienes una ilustración en public/ */}
      <img
        src="../images/logo.png"
        alt="Ilustración divertida"
        className="w-64 h-64 mb-8 shadow-2xl rounded-full shadow-red-900 "
      />
      <Link
        href="/"
        className="px-6 py-3 bg-white text-blue-900 rounded-full shadow-lg hover:bg-blue-500 transition"
      >
        Regresa al inicio
      </Link>
    </div>
  );
}
