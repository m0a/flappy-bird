import { useEffect, useRef } from "react";
import { useGame } from "../hooks/useGame";

interface GameProps {
  onGameOver: (score: number) => void;
}

export function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gameState,
    score,
    bird,
    pipes,
    jump,
    canvasWidth,
    canvasHeight,
    birdSize,
    pipeWidth,
    pipeGap,
  } = useGame();

  useEffect(() => {
    if (gameState === "gameover") {
      onGameOver(score);
    }
  }, [gameState, score, onGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw pipes
    ctx.fillStyle = "#228B22";
    pipes.forEach((pipe) => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(
        pipe.x,
        pipe.topHeight + pipeGap,
        pipeWidth,
        canvasHeight - pipe.topHeight - pipeGap
      );
    });

    // Draw bird
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(bird.x + birdSize / 2, bird.y + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(bird.x + birdSize / 2 + 5, bird.y + birdSize / 2 - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(score.toString(), canvasWidth / 2, 50);

    // Draw start message
    if (gameState === "ready") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Click or Press Space to Start", canvasWidth / 2, canvasHeight / 2);
    }
  }, [bird, pipes, score, gameState, canvasWidth, canvasHeight, birdSize, pipeWidth, pipeGap]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={jump}
      style={{ cursor: "pointer", border: "2px solid #333", borderRadius: "8px" }}
    />
  );
}
