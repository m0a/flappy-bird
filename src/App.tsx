import { useState, useCallback } from "react";
import { Game } from "./client/components/Game";
import { Ranking } from "./client/components/Ranking";
import { GameOverModal } from "./client/components/GameOverModal";
import "./App.css";

function App() {
  const [gameKey, setGameKey] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [rankingKey, setRankingKey] = useState(0);

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setShowGameOver(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowGameOver(false);
    setGameKey((prev) => prev + 1);
  }, []);

  const handleScoreSubmitted = useCallback(() => {
    setRankingKey((prev) => prev + 1);
  }, []);

  return (
    <div className="app-container">
      <h1 className="app-title">Flappy Bird</h1>
      <div className="game-area">
        <Game key={gameKey} onGameOver={handleGameOver} />
        <Ranking key={rankingKey} />
      </div>
      {showGameOver && (
        <GameOverModal
          score={finalScore}
          onClose={handleCloseModal}
          onScoreSubmitted={handleScoreSubmitted}
        />
      )}
    </div>
  );
}

export default App;
