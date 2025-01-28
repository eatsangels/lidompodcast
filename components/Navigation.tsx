"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  BookOpen,
  BarChart,
  Users,
  Newspaper,
  Image,
  UserCog,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Inicio", href: "/", icon: Home },
  // { label: "Calendario", href: "/calendario", icon: Calendar },
  { label: "Historia", href: "/historia", icon: BookOpen },
  { label: "Estadística", href: "/estadistica", icon: BarChart },
  { label: "Comunidad", href: "/comunidad", icon: Users },
  { label: "InfoMedia", href: "/infomedia", icon: Newspaper },
  { label: "Multimedia", href: "/multimedia", icon: Image },
  { label: "Directivos", href: "/directivos", icon: UserCog },
  // { label: "Temporadas", href: "/temporadas", icon: Clock },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-t from-red-900/90 to-blue-800/70 text-red shadow-sm">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 ">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="Lidom Podcast Show Logo"
                className="relative h-16 w-16 rounded-full"
              />
              <span className="text-lg font-bold text-justify">Lidom  </span><span className="text-xl font-bold text-justify "><br />Podcast Show</span>
            </Link>
          </div>

          {/* Espaciador */}
          <div className="flex-grow" />

          {/* Desktop Navigation */}
          <div className="hidden md:block bg-gradient-to-r from-blue-800 to-indigo-900 bg-cyan-00 shadow-lg shadow-cyan-500/90 rounded-lg">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2",
                    pathname === item.href
                      ? "bg-blue-700 text-white linear-gradient"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium display-flex items-center space-x-2",
                    pathname === item.href
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}