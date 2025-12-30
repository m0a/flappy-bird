import { useEffect, useRef } from "react";
import { useGame } from "../hooks/useGame";

interface GameProps {
  onGameOver: (score: number) => void;
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  scale: number
) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();
  ctx.translate(centerX * scale, centerY * scale);
  ctx.rotate((rotation * Math.PI) / 180);

  const s = scale;

  // Body (orange/yellow)
  ctx.fillStyle = "#FFA500";
  ctx.beginPath();
  ctx.ellipse(0, 0, (size / 2) * s, (size / 2.5) * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = "#FF8C00";
  ctx.beginPath();
  ctx.ellipse(-2 * s, 4 * s, 10 * s, 6 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye white
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(8 * s, -4 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupil
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(10 * s, -4 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlight
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(11 * s, -5 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#FF6347";
  ctx.beginPath();
  ctx.moveTo(12 * s, 2 * s);
  ctx.lineTo(22 * s, 4 * s);
  ctx.lineTo(12 * s, 8 * s);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  topHeight: number,
  gap: number,
  canvasHeight: number,
  pipeWidth: number,
  scale: number
) {
  const capHeight = 20 * scale;
  const capOverhang = 4 * scale;

  // Top pipe body
  ctx.fillStyle = "#228B22";
  ctx.fillRect(x * scale, 0, pipeWidth * scale, topHeight * scale);

  // Top pipe cap
  ctx.fillStyle = "#32CD32";
  ctx.fillRect(
    x * scale - capOverhang,
    (topHeight - capHeight / scale) * scale,
    pipeWidth * scale + capOverhang * 2,
    capHeight
  );

  // Bottom pipe body
  const bottomY = topHeight + gap;
  ctx.fillStyle = "#228B22";
  ctx.fillRect(
    x * scale,
    bottomY * scale,
    pipeWidth * scale,
    (canvasHeight - bottomY) * scale
  );

  // Bottom pipe cap
  ctx.fillStyle = "#32CD32";
  ctx.fillRect(
    x * scale - capOverhang,
    bottomY * scale,
    pipeWidth * scale + capOverhang * 2,
    capHeight
  );
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
    scale,
    birdSize,
    pipeWidth,
    pipeGap,
    baseHeight,
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

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, canvasHeight - 24, canvasWidth, 4);

    // Draw pipes
    pipes.forEach((pipe) => {
      drawPipe(ctx, pipe.x, pipe.topHeight, pipeGap, baseHeight, pipeWidth, scale);
    });

    // Draw bird
    drawBird(ctx, bird.x, bird.y, birdSize, bird.rotation, scale);

    // Draw score
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = `bold ${32 * scale}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeText(score.toString(), canvasWidth / 2, 50 * scale);
    ctx.fillText(score.toString(), canvasWidth / 2, 50 * scale);

    // Draw start message
    if (gameState === "ready") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#FFF";
      ctx.font = `bold ${20 * scale}px Arial`;
      ctx.fillText("Tap or Press Space", canvasWidth / 2, canvasHeight / 2 - 15 * scale);
      ctx.fillText("to Start", canvasWidth / 2, canvasHeight / 2 + 15 * scale);
    }
  }, [bird, pipes, score, gameState, canvasWidth, canvasHeight, scale, birdSize, pipeWidth, pipeGap, baseHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={jump}
      onTouchStart={(e) => {
        e.preventDefault();
        jump();
      }}
      style={{
        cursor: "pointer",
        border: "3px solid #333",
        borderRadius: "8px",
        touchAction: "none",
        maxWidth: "100%",
      }}
    />
  );
}
