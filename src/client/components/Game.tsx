import { useEffect, useRef } from "react";
import { useGame } from "../hooks/useGame";

interface GameProps {
  onGameOver: (score: number) => void;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[],
  scale: number
) {
  if (trail.length < 2) return;

  const maxAge = 30;

  // Draw air flow lines connecting trail points
  for (let i = 1; i < trail.length; i++) {
    const point = trail[i];
    const prevPoint = trail[i - 1];
    const alpha = Math.max(0, 1 - point.age / maxAge);
    const lineWidth = Math.max(0.5, (1 - point.age / maxAge) * 4);

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = lineWidth * scale;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(prevPoint.x * scale, prevPoint.y * scale);
    ctx.lineTo(point.x * scale, point.y * scale);
    ctx.stroke();
  }

  // Draw small particles dispersing from trail
  trail.forEach((point, i) => {
    if (i % 3 === 0) {
      const alpha = Math.max(0, 1 - point.age / maxAge);
      const size = Math.max(1, (1 - point.age / maxAge) * 3);
      // Particles drift slightly as they age
      const drift = point.age * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        (point.x + Math.sin(point.age * 0.3 + i) * drift) * scale,
        (point.y + Math.cos(point.age * 0.3 + i) * drift) * scale,
        size * scale,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  scale: number,
  flapFrame: number
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

  // Wing - flaps on tap
  // flapFrame 1-5: wing up, 6-10: wing down, 11-15: return to normal
  let wingY = 4; // Default position
  let wingAngle = -0.3;

  if (flapFrame > 0 && flapFrame <= 5) {
    // Wing up (rapid upstroke)
    const t = flapFrame / 5;
    wingY = 4 - 10 * t;
    wingAngle = -0.3 - 0.6 * t;
  } else if (flapFrame > 5 && flapFrame <= 10) {
    // Wing down (downstroke)
    const t = (flapFrame - 5) / 5;
    wingY = -6 + 14 * t;
    wingAngle = -0.9 + 0.8 * t;
  } else if (flapFrame > 10 && flapFrame <= 15) {
    // Return to normal
    const t = (flapFrame - 10) / 5;
    wingY = 8 - 4 * t;
    wingAngle = -0.1 - 0.2 * t;
  }

  ctx.fillStyle = "#FF8C00";
  ctx.beginPath();
  ctx.ellipse(-2 * s, wingY * s, 10 * s, 6 * s, wingAngle, 0, Math.PI * 2);
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
  const gameOverCalledRef = useRef(false);
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
    flapFrame,
    trail,
  } = useGame();

  useEffect(() => {
    if (gameState === "gameover" && !gameOverCalledRef.current) {
      gameOverCalledRef.current = true;
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
    const groundHeight = 20 * scale;
    const grassHeight = 4 * scale;
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, canvasHeight - groundHeight - grassHeight, canvasWidth, grassHeight);

    // Draw pipes
    pipes.forEach((pipe) => {
      drawPipe(ctx, pipe.x, pipe.topHeight, pipe.gap, baseHeight, pipeWidth, scale);
    });

    // Draw trail (air flow effect)
    if (gameState === "playing") {
      drawTrail(ctx, trail, scale);
    }

    // Draw bird
    drawBird(ctx, bird.x, bird.y, birdSize, bird.rotation, scale, flapFrame);

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
  }, [bird, pipes, score, gameState, canvasWidth, canvasHeight, scale, birdSize, pipeWidth, pipeGap, baseHeight, flapFrame, trail]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
        border: isMobile ? "none" : "3px solid #333",
        borderRadius: isMobile ? "0" : "8px",
        touchAction: "none",
        maxWidth: "100%",
        display: "block",
      }}
    />
  );
}
