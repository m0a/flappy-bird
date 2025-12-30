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
    <div style={styles.container}>
      <h1 style={styles.title}>Flappy Bird</h1>
      <div style={styles.gameArea}>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f0f0f0",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  gameArea: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "center",
  },
};

export default App;
