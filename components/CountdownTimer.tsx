"use client";

import { useEffect, useState } from "react";

const CountdownTimer = () => {
  const targetDate = new Date("2025-10-16T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ months, days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="z-1mt-8 p-4 md:p-6 bg-white/45 backdrop-blur-sm rounded-2xl border-4 border-blue-400 shadow-2xl 
           w-full max-w-[90%] mx-auto
           md:max-w-[500px] md:border-2 md:shadow-lg
           transform transition-all duration-300
           hover:scale-105 hover:shadow-xl
           active:scale-95
           md:hover:scale-100
           animate-fade-in-up">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-white text-center drop-shadow-md">
        INICIO DE LIDOM 2025-26
      </h3>
      
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
        {/* Meses */}
        <div className="text-center bg-blue-500 p-3 rounded-xl min-w-[70px] md:min-w-[90px]
               transform transition hover:scale-110 hover:bg-blue-600
               shadow-lg shadow-blue-400/30">
          <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
            {timeLeft.months}
          </div>
          <div className="text-xs md:text-sm text-blue-100 font-medium">meses</div>
        </div>
        
        {/* Días */}
        <div className="text-center bg-blue-500 p-3 rounded-xl min-w-[70px] md:min-w-[90px]
               transform transition hover:scale-110 hover:bg-blue-600
               shadow-lg shadow-blue-400/30">
          <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
            {timeLeft.days}
          </div>
          <div className="text-xs md:text-sm text-blue-100 font-medium">días</div>
        </div>
        
        {/* Horas */}
        <div className="text-center bg-blue-500 p-3 rounded-xl min-w-[70px] md:min-w-[90px]
               transform transition hover:scale-110 hover:bg-blue-600
               shadow-lg shadow-blue-400/30">
          <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
            {timeLeft.hours}
          </div>
          <div className="text-xs md:text-sm text-blue-100 font-medium">horas</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;