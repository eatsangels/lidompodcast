"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Circle, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BatterUpdater from "@/components/BatterUpdater";
import PitcherUpdater from "@/components/PitcherUpdater";

type LiveGame = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  inning: number;
  isTopInning: boolean;
  outs: number;
  firstBase: boolean;
  firstBaseRunner: string | null;
  secondBase: boolean;
  secondBaseRunner: string | null;
  thirdBase: boolean;
  thirdBaseRunner: string | null;
  status: "pre" | "live" | "final";
  startTime: string;
  balls: number;
  strikes: number;
  currentBatter: string;
  currentPitcher: string;
};

type PlayType = {
  category: string;
  type: string;
  subType?: string;
  description: string;
  basesToAdvance: number;
  isOut: boolean;
  affectsScore: boolean;
  affectsRunners: boolean;
};

type SelectedPlay = {
  gameId: string;
  playType: PlayType;
  batter: string;
  runners: string[];
};

const transformGame = (game: any): LiveGame => ({
  id: game.id,
  homeTeam: game.home_team,
  awayTeam: game.away_team,
  homeScore: game.home_score,
  awayScore: game.away_score,
  inning: game.inning,
  isTopInning: game.is_top_inning,
  outs: game.outs,
  firstBase: game.first_base,
  firstBaseRunner: game.first_base_runner,
  secondBase: game.second_base,
  secondBaseRunner: game.second_base_runner,
  thirdBase: game.third_base,
  thirdBaseRunner: game.third_base_runner,
  status: game.status,
  startTime: game.start_time,
  balls: game.balls,
  strikes: game.strikes,
  currentBatter: game.current_batter,
  currentPitcher: game.current_pitcher,
});

const PLAY_TYPES: PlayType[] = [
  {
    category: 'Bateo',
    type: 'Hit',
    subType: 'Sencillo',
    description: 'Sencillo',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Bateo',
    type: 'Hit',
    subType: 'Doble',
    description: 'Doble',
    basesToAdvance: 2,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Bateo',
    type: 'Hit',
    subType: 'Triple',
    description: 'Triple',
    basesToAdvance: 3,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Bateo',
    type: 'Hit',
    subType: 'Jonrón',
    description: 'Jonrón',
    basesToAdvance: 4,
    isOut: false,
    affectsScore: true,
    affectsRunners: true
  },
  {
    category: 'Bateo',
    type: 'Base por Bolas',
    description: 'Base por Bolas',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Bateo',
    type: 'Golpeado por la Pelota',
    description: 'HBP',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Out',
    type: 'Strikeout',
    description: 'Ponche',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Out',
    type: 'Fly Out',
    description: 'Elevado Atrapado',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Out',
    type: 'Ground Out',
    description: 'Rodado Atrapado',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Out',
    type: 'Line Out',
    description: 'Línea Atrapada',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Out',
    type: 'Double Play',
    description: 'Doble Play',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Defensa',
    type: 'Asistencia',
    description: 'Asistencia',
    basesToAdvance: 0,
    isOut: false,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Defensa',
    type: 'Error',
    description: 'Error',
    basesToAdvance: 0,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Especial',
    type: 'Infield Fly',
    description: 'Regla Infield Fly',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: false
  },
  {
    category: 'Especial',
    type: 'Wild Pitch',
    description: 'Lanzamiento Descontrolado',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Especial',
    type: 'Passed Ball',
    description: 'Pelota Pasada',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Corredor',
    type: 'Stolen Base',
    description: 'Base Robada',
    basesToAdvance: 1,
    isOut: false,
    affectsScore: false,
    affectsRunners: true
  },
  {
    category: 'Corredor',
    type: 'Caught Stealing',
    description: 'Atrapado Robando',
    basesToAdvance: 0,
    isOut: true,
    affectsScore: false,
    affectsRunners: true
  },
];

export default function AdminLiveGamesPage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlay, setSelectedPlay] = useState<SelectedPlay | null>(null);
  const [showPlaySelector, setShowPlaySelector] = useState(false);
  const pageSize = 10;
  const [totalGames, setTotalGames] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA")
  );

  const supabase = createClient();
  const teams = [
    "Águilas Cibaeñas",
    "Tigres del Licey",
    "Gigantes del Cibao",
    "Estrellas Orientales",
    "Leones del Escogido",
    "Toros del Este",
  ];

  const getNextPlayOrder = async (gameId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("game_plays")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);
    if (error) {
      console.error("Error obteniendo el orden de jugadas:", error);
      return 1;
    }
    return (count || 0) + 1;
  };

  const registerPlay = async (
    gameId: string,
    playType: string,
    description: string,
    additionalData?: Partial<LiveGame> & { 
      batter?: string;
      runners?: string[];
      subType?: string;
      firstBaseRunner?: string | null;
      secondBaseRunner?: string | null;
      thirdBaseRunner?: string | null;
    }
  ) => {
    const playOrder = await getNextPlayOrder(gameId);
    
    const currentGame = games.find(g => g.id === gameId);
    const originalRunners = [
      currentGame?.firstBaseRunner,
      currentGame?.secondBaseRunner,
      currentGame?.thirdBaseRunner
    ].filter(Boolean) as string[];
  
    let fullDescription = '';
    let involvedRunners: string[] = [];
  
    switch(playType) {
      case 'Hit':
        fullDescription = `${additionalData?.batter || 'Bateador'} - ${description}`;
        involvedRunners = originalRunners.filter(r => r !== additionalData?.batter);
        break;
      
      case 'Stolen Base':
        involvedRunners = [currentGame?.firstBaseRunner || ''].filter(Boolean);
        fullDescription = `${involvedRunners[0] || 'Corredor'} - ${description}`;
        break;
      
      case 'Caught Stealing':
        involvedRunners = [currentGame?.firstBaseRunner || ''].filter(Boolean);
        fullDescription = `${involvedRunners[0] || 'Corredor'} - ${description}`;
        break;
      
      case 'Double Play':
        involvedRunners = originalRunners;
        fullDescription = `${additionalData?.batter || 'Bateador'} - ${description}`;
        break;
      
      case 'Strikeout':
      case 'Fly Out':
      case 'Ground Out':
      case 'Line Out':
      case 'Infield Fly':
        fullDescription = `${additionalData?.batter || 'Bateador'} - ${description}`;
        involvedRunners = originalRunners;
        break;

      case 'Base por Bolas':
      case 'Golpeado por la Pelota':
        fullDescription = `${additionalData?.batter || 'Bateador'} - ${description}`;
        involvedRunners = originalRunners;
        break;

        
      
      default:
        fullDescription = description;
        involvedRunners = originalRunners;
    }
  
    const playData = {
      game_id: gameId,
      play_order: playOrder,
      play_type: playType,
      sub_type: additionalData?.subType,
      description: fullDescription,
      batter_id: additionalData?.batter,
      runners: involvedRunners.length > 0 ? JSON.stringify(involvedRunners) : null,
      first_base_runner: additionalData?.firstBaseRunner,
      second_base_runner: additionalData?.secondBaseRunner,
      third_base_runner: additionalData?.thirdBaseRunner,
      inning: additionalData?.inning || 0,
      is_top_inning: additionalData?.isTopInning ?? true,
      outs: additionalData?.outs,
      balls: additionalData?.balls,
      strikes: additionalData?.strikes,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from("game_plays").insert([playData]);
    if (error) {
      console.error("Error registrando la jugada:", error);
    }
  };

  const advanceForcedRunners = (currentGame: LiveGame): LiveGame => {
    const newGame = { ...currentGame };
    const wereBasesLoaded = newGame.firstBase && newGame.secondBase && newGame.thirdBase;
    
    newGame.thirdBaseRunner = newGame.secondBaseRunner;
    newGame.secondBaseRunner = newGame.firstBaseRunner;
    newGame.firstBaseRunner = currentGame.currentBatter;
    
    const runs = wereBasesLoaded ? 1 : 0;

    return {
      ...newGame,
      firstBase: true,
      secondBase: newGame.firstBase,
      thirdBase: newGame.secondBase,
      [newGame.isTopInning ? 'awayScore' : 'homeScore']: newGame[newGame.isTopInning ? 'awayScore' : 'homeScore'] + runs
    };
  };

  const handleStolenBase = (currentGame: LiveGame): LiveGame => {
    const newGame = { ...currentGame };
    
    if (newGame.firstBase) {
      // Mover de primera a segunda
      newGame.secondBase = true;
      newGame.secondBaseRunner = newGame.firstBaseRunner;  // Mover al corredor de primera a segunda
      newGame.firstBase = false;
      newGame.firstBaseRunner = null;
    } else if (newGame.secondBase) {
      // Mover de segunda a tercera
      newGame.thirdBase = true;
      newGame.thirdBaseRunner = newGame.secondBaseRunner;  // Mover al corredor de segunda a tercera
      newGame.secondBase = false;
      newGame.secondBaseRunner = null;
    } else if (newGame.thirdBase) {
      // Anotar carrera
      newGame.thirdBase = false;
      newGame.thirdBaseRunner = null;
      if (newGame.isTopInning) {
        newGame.awayScore += 1;
      } else {
        newGame.homeScore += 1;
      }
    }
    
    return newGame;
  };
  
  const handleDoublePlay = (currentGame: LiveGame): LiveGame => {
    const newGame = { ...currentGame };
    newGame.firstBase = false;
    newGame.secondBase = false;
    newGame.firstBaseRunner = null;
    newGame.secondBaseRunner = null;
    newGame.outs += 2;
    
    if (newGame.outs >= 3) {
      newGame.outs = 0;
      newGame.thirdBase = false;
      newGame.thirdBaseRunner = null;
      newGame.isTopInning = !newGame.isTopInning;
      if (!newGame.isTopInning) newGame.inning += 1;
    }
    
    return newGame;
  };

  const advanceRunners = (currentGame: LiveGame, bases: number): LiveGame => {
    const newGame = { ...currentGame };
    let runs = 0;
  
    const runners = [
      { base: 1, isOn: newGame.firstBase, runner: newGame.firstBaseRunner },
      { base: 2, isOn: newGame.secondBase, runner: newGame.secondBaseRunner },
      { base: 3, isOn: newGame.thirdBase, runner: newGame.thirdBaseRunner },
    ];
  
    // Resetear las bases
    newGame.firstBase = false;
    newGame.secondBase = false;
    newGame.thirdBase = false;
    newGame.firstBaseRunner = null;
    newGame.secondBaseRunner = null;
    newGame.thirdBaseRunner = null;
  
    // Mover a los corredores existentes
    runners.forEach(({ base, isOn, runner }) => {
      if (isOn && runner) {
        const newBase = base + bases;
        if (newBase >= 4) {
          runs += 1; // El corredor anota una carrera
        } else {
          switch (newBase) {
            case 1:
              newGame.firstBase = true;
              newGame.firstBaseRunner = runner;
              break;
            case 2:
              newGame.secondBase = true;
              newGame.secondBaseRunner = runner;
              break;
            case 3:
              newGame.thirdBase = true;
              newGame.thirdBaseRunner = runner;
              break;
          }
        }
      }
    });
  
    // Para jonrones, el bateador también anota
    if (bases === 4) {
      runs += 1; // Solo sumamos 1 por el bateador
    } else if (bases > 0 && bases < 4) {
      // Agregar al bateador a la base correspondiente (solo para hits que no son jonrones)
      switch (bases) {
        case 1:
          newGame.firstBase = true;
          newGame.firstBaseRunner = currentGame.currentBatter;
          break;
        case 2:
          newGame.secondBase = true;
          newGame.secondBaseRunner = currentGame.currentBatter;
          break;
        case 3:
          newGame.thirdBase = true;
          newGame.thirdBaseRunner = currentGame.currentBatter;
          break;
      }
    }
  
    // Actualizar el marcador
    const scoreKey = newGame.isTopInning ? 'awayScore' : 'homeScore';
    newGame[scoreKey] += runs;
  
    return newGame;
  };

  const handlePlaySelection = async (playType: PlayType) => {
    if (!selectedPlay) return;
  
    const currentGame = games.find((g) => g.id === selectedPlay.gameId);
    if (!currentGame) return;
  
    let newState = { ...currentGame };
  
    // Definimos runnersInvolved aquí
    let runnersInvolved: string[] = [];
  
    // Manejar jugadas que afectan corredores
    if (playType.affectsRunners) {
      switch (playType.type) {
        case "Stolen Base":
          newState = handleStolenBase(newState);
          runnersInvolved = [
            newState.firstBaseRunner,
            newState.secondBaseRunner,
            newState.thirdBaseRunner,
          ].filter(Boolean) as string[];
          break;
  
        case "Golpeado por la Pelota":
        case "Base por Bolas":
          newState = advanceForcedRunners(newState);
          runnersInvolved = [
            newState.firstBaseRunner,
            newState.secondBaseRunner,
            newState.thirdBaseRunner,
          ].filter(Boolean) as string[];
          break;
  
        case "Double Play":
          newState = handleDoublePlay(newState);
          runnersInvolved = [
            newState.firstBaseRunner,
            newState.secondBaseRunner,
          ].filter(Boolean) as string[];
          break;
  
        default:
          // Manejar hits (sencillos, dobles, triples, jonrones)
          if (playType.category === "Bateo" && playType.type === "Hit") {
            newState = advanceRunners(newState, playType.basesToAdvance);
          }
          runnersInvolved = [
            newState.firstBaseRunner,
            newState.secondBaseRunner,
            newState.thirdBaseRunner,
          ].filter(Boolean) as string[];
      }
    }
  
    // Manejar hits específicamente para asignar al bateador a las bases
    if (playType.category === "Bateo" && playType.type === "Hit" && playType.basesToAdvance < 4) {
  const bases = playType.basesToAdvance;
  if (bases === 1) {
    newState.firstBase = true;
    newState.firstBaseRunner = currentGame.currentBatter;
  } else if (bases === 2) {
    newState.secondBase = true;
    newState.secondBaseRunner = currentGame.currentBatter;
  } else if (bases === 3) {
    newState.thirdBase = true;
    newState.thirdBaseRunner = currentGame.currentBatter;
  }
}

  
    // Manejar outs
    if (playType.isOut && playType.type !== "Double Play") {
      newState.outs += 1;
      if (newState.outs >= 3) {
        newState.outs = 0;
        newState.firstBase = false;
        newState.secondBase = false;
        newState.thirdBase = false;
        newState.firstBaseRunner = null;
        newState.secondBaseRunner = null;
        newState.thirdBaseRunner = null;
        
        // Guardar el estado original antes de cambiarlo
        const wasTopInning = newState.isTopInning;
        newState.isTopInning = !wasTopInning;
        
        // Solo incrementar el inning si estábamos en la parte baja
        if (!wasTopInning) {
          newState.inning += 1;
        }
      }
    }
    // Actualizar el estado del juego
    await updateGame(selectedPlay.gameId, newState);
  
    // Registrar la jugada
    await registerPlay(
      selectedPlay.gameId,
      playType.type,
      playType.description,
      {
        ...newState,
        subType: playType.subType,
        batter: selectedPlay.batter,
        runners: runnersInvolved,
        firstBaseRunner: newState.firstBaseRunner,
        secondBaseRunner: newState.secondBaseRunner,
        thirdBaseRunner: newState.thirdBaseRunner,
      }
    );
  
    setShowPlaySelector(false);
    setSelectedPlay(null);
  };

  const GamePlayItem = ({ play }: { play: any }) => {
    const formatDescription = () => {
      const players = play.runners ? JSON.parse(play.runners) : [];
      const time = new Date(play.created_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
  
      return (
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{play.play_order}. {play.description}</span>
            {players.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                (Mueve a: {players.join(', ')})
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
      );
    };
  
    return (
      <div className="py-2 border-b">
        {formatDescription()}
      </div>
    );
  };

  const updateGame = async (id: string, updates: Partial<LiveGame>) => {
    const currentGame = games.find((game) => game.id === id);
    if (!currentGame) return;

    let finalUpdates = { ...updates };
    const snakeCaseUpdates: any = {
      current_batter: finalUpdates.currentBatter,
      current_pitcher: finalUpdates.currentPitcher,
      first_base_runner: finalUpdates.firstBaseRunner,
      second_base_runner: finalUpdates.secondBaseRunner,
      third_base_runner: finalUpdates.thirdBaseRunner,
    };

    if (finalUpdates.homeTeam !== undefined)
      snakeCaseUpdates.home_team = finalUpdates.homeTeam;
    if (finalUpdates.awayTeam !== undefined)
      snakeCaseUpdates.away_team = finalUpdates.awayTeam;
    if (finalUpdates.homeScore !== undefined)
      snakeCaseUpdates.home_score = finalUpdates.homeScore;
    if (finalUpdates.awayScore !== undefined)
      snakeCaseUpdates.away_score = finalUpdates.awayScore;
    if (finalUpdates.inning !== undefined)
      snakeCaseUpdates.inning = finalUpdates.inning;
    if (finalUpdates.isTopInning !== undefined)
      snakeCaseUpdates.is_top_inning = finalUpdates.isTopInning;
    if (finalUpdates.outs !== undefined)
      snakeCaseUpdates.outs = finalUpdates.outs;
    if (finalUpdates.firstBase !== undefined)
      snakeCaseUpdates.first_base = finalUpdates.firstBase;
    if (finalUpdates.secondBase !== undefined)
      snakeCaseUpdates.second_base = finalUpdates.secondBase;
    if (finalUpdates.thirdBase !== undefined)
      snakeCaseUpdates.third_base = finalUpdates.thirdBase;
    if (finalUpdates.status !== undefined)
      snakeCaseUpdates.status = finalUpdates.status;
    if (finalUpdates.startTime !== undefined)
      snakeCaseUpdates.start_time = finalUpdates.startTime;
    if (finalUpdates.balls !== undefined)
      snakeCaseUpdates.balls = finalUpdates.balls;
    if (finalUpdates.strikes !== undefined)
      snakeCaseUpdates.strikes = finalUpdates.strikes;

    try {
      const { data, error } = await supabase
        .from("live_games")
        .update(snakeCaseUpdates)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        const updatedGame: LiveGame = transformGame(data[0]);
        setGames((current) =>
          current.map((game) => (game.id === id ? updatedGame : game))
        );
      }
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Error al actualizar el juego");
    }
  };

  useEffect(() => {
    fetchGames();
  }, [currentPage, selectedDate]);

  useEffect(() => {
    const channel = supabase
      .channel("live_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_games" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newGameData = payload.new;
            if (
              newGameData.start_time &&
              newGameData.start_time.startsWith(selectedDate)
            ) {
              if (currentPage === 1) {
                setGames((current) =>
                  [transformGame(newGameData), ...current].slice(0, pageSize)
                );
              }
              setTotalGames((prev) => prev + 1);
            }
          } else if (payload.eventType === "UPDATE") {
            setGames((current) =>
              current.map((game) =>
                game.id === payload.new.id ? transformGame(payload.new) : game
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGames((current) =>
              current.filter((game) => game.id !== payload.old.id)
            );
            setTotalGames((prev) => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, currentPage]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize - 1;
      const startDate = new Date(selectedDate + "T00:00:00");
      const endDate = new Date(selectedDate + "T23:59:59.999");

      const { data, error, count } = await supabase
        .from("live_games")
        .select("*", { count: "exact" })
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) throw error;
      setGames((data || []).map(transformGame));
      setTotalGames(count ?? 0);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGame = async () => {
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from("live_games")
        .insert([
          {
            home_team: teams[0],
            away_team: teams[1],
            start_time: new Date().toISOString(),
            status: "pre",
            current_batter: "Por determinar",
            current_pitcher: "Por determinar",
          },
        ])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newGame = transformGame(data[0]);
        await registerPlay(
          newGame.id,
          "game_created",
          "Juego creado",
          {
            inning: newGame.inning,
            isTopInning: newGame.isTopInning,
            outs: newGame.outs,
            firstBase: newGame.firstBase,
            secondBase: newGame.secondBase,
            thirdBase: newGame.thirdBase,
            balls: newGame.balls,
            strikes: newGame.strikes,
          }
        );
      }
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchGames();
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error al crear el juego");
    } finally {
      setIsCreating(false);
    }
  };

  const totalPages = Math.ceil(totalGames / pageSize) || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen from-black/95 to-blue-900 bg-gradient-to-b bg-cover bg-center">
      {/* Modal de selección de jugadas */}
      {showPlaySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">📝 Seleccionar Tipo de Jugada</h3>
            <div className="space-y-4">
              {Object.entries(
                PLAY_TYPES.reduce((acc: Record<string, PlayType[]>, play) => {
                  if (!acc[play.category]) acc[play.category] = [];
                  acc[play.category].push(play);
                  return acc;
                }, {})
              ).map(([category, plays]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">⚾ {category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {plays.map((play) => (
                      <Button
                        key={play.description}
                        onClick={() => handlePlaySelection(play)}
                        className="text-sm h-10"
                        variant="outline"
                      >
                        {play.description}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowPlaySelector(false)}
              className="mt-4 w-full"
              variant="destructive"
            >
              🚫 Cancelar
            </Button>
          </div>
        </div>
      )}
  
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-500 shadow-md shadow-red-500 rounded-xl p-4">
            ⚾ Juegos en Vivo
          </h1>
          <div className="flex space-x-4 items-center">
            <Label htmlFor="dateFilter" className="text-white">
              📅 Fecha:
            </Label>
            <Input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 p-2"
            />
            <Button
              onClick={createGame}
              disabled={isCreating}
              className="bg-blue-900 text-black"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <span>⚾ <Plus className="h-4 w-4 mr-2 inline" /> Nuevo Juego</span>
              )}
            </Button>
          </div>
        </div>
  
        {/* Lista de juegos */}
        <div className="grid gap-8">
          {games.map((game) => (
            <Card key={game.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información del juego */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">ℹ️ Información del Juego</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>🏟️ Estado</Label>
                      <select
                        className="w-full mt-1 rounded-md border border-gray-300 p-2"
                        value={game.status}
                        onChange={(e) =>
                          updateGame(game.id, {
                            status: e.target.value as LiveGame["status"],
                          })
                        }
                      >
                        <option value="pre">⏳ Pre-juego</option>
                        <option value="live">▶️ En Vivo</option>
                        <option value="final">🏁 Final</option>
                      </select>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>🧢 Equipo Visitante</Label>
                        <select
                          className="w-full mt-1 rounded-md border border-gray-300 p-2"
                          value={game.awayTeam}
                          onChange={(e) =>
                            updateGame(game.id, { awayTeam: e.target.value })
                          }
                        >
                          {teams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>🧢 Equipo Local</Label>
                        <select
                          className="w-full mt-1 rounded-md border border-gray-300 p-2"
                          value={game.homeTeam}
                          onChange={(e) =>
                            updateGame(game.id, { homeTeam: e.target.value })
                          }
                        >
                          {teams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>🏆 Carreras Visitante</Label>
                        <Input
                          type="number"
                          value={game.awayScore}
                          onChange={(e) =>
                            updateGame(game.id, {
                              awayScore: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>🏆 Carreras Local</Label>
                        <Input
                          type="number"
                          value={game.homeScore}
                          onChange={(e) =>
                            updateGame(game.id, {
                              homeScore: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Estado del juego */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">🎮 Estado del Juego</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>🏠 Entrada</Label>
                        <Input
                          type="number"
                          value={game.inning}
                          onChange={(e) =>
                            updateGame(game.id, {
                              inning: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>⬆️⬇️ Alta/Baja</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            checked={game.isTopInning}
                            onCheckedChange={(checked) =>
                              updateGame(game.id, { isTopInning: checked })
                            }
                          />
                          <span>{game.isTopInning ? "⬆️ Alta" : "⬇️ Baja"}</span>
                        </div>
                      </div>
                    </div>
  
                    <div>
                      <Label>❌ Outs</Label>
                      <div className="flex space-x-2 mt-2">
                        {[0, 1, 2].map((out) => (
                          <button
                            key={out}
                            onClick={() => updateGame(game.id, { outs: out + 1 })}
                            className={`p-2 rounded-full ${
                              game.outs > out ? "bg-red-900 text-white" : "bg-blue-900"
                            }`}
                          >
                            {game.outs > out ? "❌" : "⚪"}
                          </button>
                        ))}
                      </div>
                    </div>
  
                    <div>
                      <Label>🏃 Bases</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex flex-col items-center">
                          <Switch
                            checked={game.firstBase}
                            onCheckedChange={(checked) =>
                              updateGame(game.id, { firstBase: checked })
                            }
                          />
                          <span>{game.firstBase ? "🏃" : "⚪"}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Switch
                            checked={game.secondBase}
                            onCheckedChange={(checked) =>
                              updateGame(game.id, { secondBase: checked })
                            }
                          />
                          <span>{game.secondBase ? "🏃" : "⚪"}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Switch
                            checked={game.thirdBase}
                            onCheckedChange={(checked) =>
                              updateGame(game.id, { thirdBase: checked })
                            }
                          />
                          <span>{game.thirdBase ? "🏃" : "⚪"}</span>
                        </div>
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>⚾ Bolas</Label>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          value={game.balls}
                          onChange={(e) => {
                            const newBalls = parseInt(e.target.value);
                            updateGame(game.id, {
                              balls: newBalls > 4 ? 4 : newBalls,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>🔥 Strikes</Label>
                        <Input
                          type="number"
                          min="0"
                          max="3"
                          value={game.strikes}
                          onChange={(e) => {
                            const newStrikes = parseInt(e.target.value);
                            updateGame(game.id, {
                              strikes: newStrikes >= 3 ? 0 : newStrikes,
                              outs: newStrikes >= 3 ? game.outs + 1 : game.outs,
                              balls: newStrikes >= 3 ? 0 : game.balls,
                            });
                          }}
                        />
                      </div>
                    </div>
  
                    <div>
                      <Label>👤 Bateador Actual</Label>
                      <div className="mt-2">
                        <BatterUpdater
                          gameId={game.id}
                          currentBatter={game.currentBatter}
                          onUpdate={(newBatter) =>
                            updateGame(game.id, { currentBatter: newBatter })
                          }
                        />
                      </div>
                    </div>
  
                    <div>
                      <Label>🎯 Lanzador Actual</Label>
                      <div className="mt-2">
                        <PitcherUpdater
                          gameId={game.id}
                          currentPitcher={game.currentPitcher}
                          onUpdate={(newPitcher) =>
                            updateGame(game.id, { currentPitcher: newPitcher })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Botón de registrar jugada */}
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setSelectedPlay({
                      gameId: game.id,
                      playType: PLAY_TYPES[0],
                      batter: game.currentBatter,
                      runners: [],
                    });
                    setShowPlaySelector(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  📝 Registrar Jugada
                </Button>
              </div>
            </Card>
          ))}
        </div>
  
        {/* Paginación */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-900 text-white"
          >
            ⬅️ Anterior
          </Button>
          <span className="text-white">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-blue-900 text-white"
          >
            Siguiente ➡️
          </Button>
        </div>
      </div>
    </div>
  );
}