import { useState, useEffect, useCallback, useRef } from "react";
import { playJumpSound, playScoreSound, playGameOverSound, resumeAudio } from "../lib/sound";

const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;
const BIRD_SIZE = 34;
const PIPE_WIDTH = 60;
const GRAVITY = 0.35;
const JUMP_FORCE = -7;

// Progressive difficulty settings
const INITIAL_PIPE_GAP = 200;  // Start with wide gap
const MIN_PIPE_GAP = 130;      // Minimum gap at high scores
const INITIAL_PIPE_SPEED = 2;  // Start slow
const MAX_PIPE_SPEED = 4;      // Maximum speed at high scores

interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
  gap: number;  // Store gap for each pipe
}

export type GameState = "ready" | "playing" | "gameover";

// Calculate difficulty based on score
function getDifficulty(score: number) {
  // Increase difficulty every 5 points
  const level = Math.floor(score / 5);

  // Gap decreases from 200 to 130 over 10 levels
  const gap = Math.max(MIN_PIPE_GAP, INITIAL_PIPE_GAP - level * 7);

  // Speed increases from 2 to 4 over 10 levels
  const speed = Math.min(MAX_PIPE_SPEED, INITIAL_PIPE_SPEED + level * 0.2);

  return { gap, speed };
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [bird, setBird] = useState<Bird>({ x: 100, y: 300, velocity: 0, rotation: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });
  const gameLoopRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(0);

  // Keep scoreRef in sync
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Responsive canvas size - fullscreen on mobile
  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Mobile: fill entire screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Use the larger scale to ensure we fill the entire screen
        const scaleByWidth = screenWidth / BASE_WIDTH;
        const scaleByHeight = screenHeight / BASE_HEIGHT;
        const fillScale = Math.max(scaleByWidth, scaleByHeight);

        setCanvasSize({
          width: BASE_WIDTH * fillScale,
          height: BASE_HEIGHT * fillScale,
        });
      } else {
        // Desktop: use bounded size
        const maxWidth = Math.min(window.innerWidth - 32, BASE_WIDTH);
        const scale = maxWidth / BASE_WIDTH;
        setCanvasSize({
          width: maxWidth,
          height: Math.min(BASE_HEIGHT * scale, window.innerHeight - 200),
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const scale = canvasSize.width / BASE_WIDTH;

  const resetGame = useCallback(() => {
    setBird({ x: 100, y: 300, velocity: 0, rotation: 0 });
    setPipes([]);
    setScore(0);
    scoreRef.current = 0;
    setGameState("ready");
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState("playing");
  }, [resetGame]);

  const jump = useCallback(() => {
    if (gameState === "ready") {
      resumeAudio();
      startGame();
    }
    if (gameState === "playing" || gameState === "ready") {
      playJumpSound();
      setBird((prev) => ({ ...prev, velocity: JUMP_FORCE, rotation: -30 }));
    }
  }, [gameState, startGame]);

  const endGame = useCallback(() => {
    setGameState("gameover");
    playGameOverSound();
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      const { speed, gap } = getDifficulty(scoreRef.current);

      setBird((prev) => {
        const newY = prev.y + prev.velocity;
        const newVelocity = prev.velocity + GRAVITY;
        const newRotation = Math.min(prev.rotation + 3, 90);

        if (newY < 0 || newY + BIRD_SIZE > BASE_HEIGHT) {
          endGame();
          return prev;
        }

        return { ...prev, y: newY, velocity: newVelocity, rotation: newRotation };
      });

      setPipes((prev) => {
        let newPipes = prev
          .map((pipe) => ({ ...pipe, x: pipe.x - speed }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < BASE_WIDTH - 200) {
          const topHeight = Math.random() * (BASE_HEIGHT - gap - 100) + 50;
          newPipes.push({ x: BASE_WIDTH, topHeight, passed: false, gap });
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
        birdBottom > pipe.topHeight + pipe.gap
      ) {
        endGame();
      }

      // Check if bird passed the pipe
      if (!pipe.passed && bird.x > pipeRight) {
        pipe.passed = true;
        setScore((prev) => prev + 1);
        playScoreSound();
      }
    });
  }, [bird, pipes, gameState, endGame]);

  // Get current difficulty for display
  const currentDifficulty = getDifficulty(score);

  return {
    gameState,
    score,
    bird,
    pipes,
    jump,
    resetGame,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    scale,
    birdSize: BIRD_SIZE,
    pipeWidth: PIPE_WIDTH,
    pipeGap: currentDifficulty.gap,
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
  };
}
