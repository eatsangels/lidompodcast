import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Lidom Podcast Show</h3>
            <p className="text-blue-100">
              .::Vive la emoción del béisbol invernal con LIDOM El Podcast::.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/noticias"
                  className="text-blue-100 hover:text-white"
                >
                  Últimas Noticias
                </Link>
              </li>
              <li>
                <Link
                  href="https://elpodcastbaseball.myspreadshop.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white"
                >
                  Tienda Oficial
                </Link>
              </li>
              {/* <li>
                <Link href="/contacto" className="text-blue-100 hover:text-white">
                  Contacto
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>joannegocios06@gmail.com</span>
              </li>
              <li>República Dominicana</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/dominicanbaseballplayers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com/elpodcastdelidom/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-700 pt-8 text-center">
          <div className="mb-4">
            <Link href="/terminos">
              <button className="bg-red-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                Términos y Condiciones
              </button>
            </Link>
          </div>
          <p className="text-blue-100">
            © {new Date().getFullYear()} Lidom Podcast Show. Todos los derechos
            reservados. Website created by{" "}
            <Link
              href="https://www.instagram.com/etrinidad/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-white font-semibold underline"
            >
              Edward Trinidad
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
