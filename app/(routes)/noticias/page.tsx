"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { debounce } from "lodash";

type News = {
  id: number;
  title: string;
  content: string;
  image_url: string;
  video_url?: string;
  category: string;
  created_at: string;
};

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const itemsPerPage = 6;
  const supabase = createClient();

  const debounceSearch = useCallback(
    debounce((query) => setDebouncedQuery(query), 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchQuery);
    return () => debounceSearch.cancel();
  }, [searchQuery, debounceSearch]);

  useEffect(() => {
    fetchNews();
  }, [currentPage, debouncedQuery]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (debouncedQuery) {
        query = query.or(
          `title.ilike.%${debouncedQuery}%,content.ilike.%${debouncedQuery}%`
        );
      }

      const { data: newsData, error, count } = await query.range(from, to);

      if (error) throw error;

      setNews((newsData || []).filter((item): item is News => !!item.id && !!item.title && !!item.content && !!item.image_url));
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/LP.jpg')] bg-cover bg-center opacity-10 " />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl ">
              Noticias
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100  ">
              Mantente al día con las últimas noticias de los Lidom Podcast Show
            </p>
            
            {/* Nueva barra de búsqueda */}
            <div className="mt-8 mx-auto max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar noticias..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ">
        {isLoading ? (
          <div className="text-center py-12 ">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600 ">Cargando noticias...</p>
          </div>
        ) : (
          <>
            {news.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No se encontraron noticias {debouncedQuery && `para "${debouncedQuery}"`}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 ">
                  {news.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow   ">
                      <div className="aspect-video w-full overflow-hidden ">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-6 ">
                        <div className="flex items-center text-sm text-gray-500 mb-2 ">
                          <Calendar className="h-4 w-4 mr-2 " />
                          {formatDate(item.created_at)}
                        </div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-white text-600 line-clamp-3  ">{item.content}</p>
                        <div className="mt-4 ">
                          <Link href={`/noticias/${item.id}`} passHref>
                            <Button variant="outline" className="w-full">
                              Leer más
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center items-center space-x-4  ">
                  <Button
                    variant="outline"
                    className="bg-blue-700 text-white hover:bg-gray-800"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <span className="text-gray-600 ">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="bg-blue-600 text-white hover:bg-blue-800"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
