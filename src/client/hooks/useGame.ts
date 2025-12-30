import { useState, useEffect, useCallback, useRef } from "react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PIPE_SPEED = 3;

interface Bird {
  x: number;
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export type GameState = "ready" | "playing" | "gameover";

export function useGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [bird, setBird] = useState<Bird>({ x: 100, y: 300, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);

  const resetGame = useCallback(() => {
    setBird({ x: 100, y: 300, velocity: 0 });
    setPipes([]);
    setScore(0);
    setGameState("ready");
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState("playing");
  }, [resetGame]);

  const jump = useCallback(() => {
    if (gameState === "ready") {
      startGame();
    }
    if (gameState === "playing") {
      setBird((prev) => ({ ...prev, velocity: JUMP_FORCE }));
    }
  }, [gameState, startGame]);

  const endGame = useCallback(() => {
    setGameState("gameover");
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      setBird((prev) => {
        const newY = prev.y + prev.velocity;
        const newVelocity = prev.velocity + GRAVITY;

        if (newY < 0 || newY + BIRD_SIZE > CANVAS_HEIGHT) {
          endGame();
          return prev;
        }

        return { ...prev, y: newY, velocity: newVelocity };
      });

      setPipes((prev) => {
        let newPipes = prev
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 200) {
          const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({ x: CANVAS_WIDTH, topHeight, passed: false });
        }

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, endGame]);

  // Collision detection and scoring
  useEffect(() => {
    if (gameState !== "playing") return;

    pipes.forEach((pipe) => {
      const birdRight = bird.x + BIRD_SIZE;
      const birdBottom = bird.y + BIRD_SIZE;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check collision with top pipe
      if (
        birdRight > pipe.x &&
        bird.x < pipeRight &&
        bird.y < pipe.topHeight
      ) {
        endGame();
      }

      // Check collision with bottom pipe
      if (
        birdRight > pipe.x &&
        bird.x < pipeRight &&
        birdBottom > pipe.topHeight + PIPE_GAP
      ) {
        endGame();
      }

      // Check if bird passed the pipe
      if (!pipe.passed && bird.x > pipeRight) {
        pipe.passed = true;
        setScore((prev) => prev + 1);
      }
    });
  }, [bird, pipes, gameState, endGame]);

  return {
    gameState,
    score,
    bird,
    pipes,
    jump,
    resetGame,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    birdSize: BIRD_SIZE,
    pipeWidth: PIPE_WIDTH,
    pipeGap: PIPE_GAP,
  };
}
