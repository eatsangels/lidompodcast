import GameResults from "@/components/GameResults";
import LiveScore from "@/components/LiveScore";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      

      {/* Live Score Section */}
      <div className="bg-white py-12">
        <LiveScore />
      </div>

      {/* Game Results Section */}
      <div className="bg-gray-50 py-12">
        <GameResults />
      </div>

      {/* Rest of the existing sections... */}
    </div>
  );
}