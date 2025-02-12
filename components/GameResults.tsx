"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GameResult = {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeHits: number;
  awayHits: number;
  homeErrors: number;
  awayErrors: number;
  winningPitcher?: string;
  losingPitcher?: string;
  savePitcher?: string;
  status: "final" | "live" | "scheduled";
};

const daysOfWeek = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export default function GameResults() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [games, setGames] = useState<GameResult[]>([]);

  const getDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-blue-900">Resultados</h2>
          <h2 className="text-2xl font-bold text-gray-400">Calendario</h2>
        </div>
        <Button variant="outline" size="icon" className="rounded-full">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-sm p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDateChange("prev")}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-12">
          {getDates().map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center ${
                  isSelected ? "text-blue-900" : "text-gray-500"
                }`}
              >
                <span className="text-xs font-medium mb-1">
                  {daysOfWeek[date.getDay()]}
                </span>
                <span className={`text-base font-bold ${isToday ? "text-blue-900" : ""}`}>
                  {formatDate(date)}
                </span>
                {isSelected && (
                  <div className="w-1.5 h-1.5 bg-blue-900 rounded-full mt-1.5" />
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDateChange("next")}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Game Results */}
      <Card className="bg-[#111827] text-white overflow-hidden">
        <div className="p-4">
          <div className="text-sm font-medium text-gray-400 mb-4">FINAL/11</div>
          
          <div className="grid grid-cols-12 gap-8">
            {/* Team Names and Scores */}
            <div className="col-span-3">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">DR</span>
                  </div>
                  <span className="font-medium">DR</span>
                  <span className="ml-auto text-sm">3 - 2</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">VEN</span>
                  </div>
                  <span className="font-medium">VEN</span>
                  <span className="ml-auto text-sm">2 - 3</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="col-span-9">
              <div className="grid grid-cols-6 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-2">C</div>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>5</div>
                    <div>4</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-2">H</div>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>9</div>
                    <div>10</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-2">E</div>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>0</div>
                    <div>0</div>
                  </div>
                </div>
              </div>

              {/* Pitchers */}
              <div className="grid grid-cols-2 gap-8 border-t border-gray-700 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    <span className="text-xs">G</span>
                  </div>
                  <div>
                    <div className="text-sm">G: Joaquin</div>
                    <div className="text-xs text-gray-400">1-0 0.00 EFE</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    <span className="text-xs">P</span>
                  </div>
                  <div>
                    <div className="text-sm">P: Scherff</div>
                    <div className="text-xs text-gray-400">0-2 4.50 EFE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Actions */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-gray-700 hover:bg-gray-700"
            >
              Resumen
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-gray-700 hover:bg-gray-700"
            >
              Num.
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}