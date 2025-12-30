import { useState } from "react";
import { submitScore } from "../lib/api";

interface GameOverModalProps {
  score: number;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

export function GameOverModal({ score, onClose, onScoreSubmitted }: GameOverModalProps) {
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || submitting) return;

    setSubmitting(true);
    try {
      await submitScore(nickname.trim(), score);
      setSubmitted(true);
      onScoreSubmitted();
    } catch (error) {
      console.error("Failed to submit score:", error);
      alert("Failed to submit score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Game Over!</h2>
        <p style={styles.score}>Your Score: {score}</p>

        {submitted ? (
          <div>
            <p style={styles.success}>Score submitted!</p>
            <button style={styles.button} onClick={onClose}>
              Play Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              style={styles.input}
              autoFocus
            />
            <div style={styles.buttons}>
              <button
                type="submit"
                style={styles.button}
                disabled={!nickname.trim() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Score"}
              </button>
              <button type="button" style={styles.buttonSecondary} onClick={onClose}>
                Skip
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    textAlign: "center",
    minWidth: "300px",
  },
  title: {
    margin: "0 0 16px 0",
    color: "#333",
  },
  score: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#e91e63",
    margin: "0 0 24px 0",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#9e9e9e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  success: {
    color: "#4CAF50",
    marginBottom: "16px",
  },
};
