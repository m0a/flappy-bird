import { useState, useCallback } from "react";
import { Game } from "./client/components/Game";
import { GameOverModal } from "./client/components/GameOverModal";
import "./App.css";

function App() {
  const [gameKey, setGameKey] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [savedNickname, setSavedNickname] = useState("");

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setShowGameOver(true);
  }, []);

  const handleCloseModal = useCallback((nickname?: string) => {
    if (nickname) {
      setSavedNickname(nickname);
    }
    setShowGameOver(false);
    setGameKey((prev) => prev + 1);
  }, []);

  return (
    <div className="app-container">
      <h1 className="app-title">Flappy Bird</h1>
      <div className="game-area">
        <Game key={gameKey} onGameOver={handleGameOver} />
      </div>
      {showGameOver && (
        <GameOverModal
          score={finalScore}
          defaultNickname={savedNickname}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
