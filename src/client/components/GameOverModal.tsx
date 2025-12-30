import { useState, useEffect } from "react";
import { submitScore, getRanking } from "../lib/api";

interface RankingEntry {
  id: number;
  nickname: string;
  score: number;
  createdAt: string | null;
}

interface GameOverModalProps {
  score: number;
  onClose: () => void;
}

export function GameOverModal({ score, onClose }: GameOverModalProps) {
  const [nickname, setNickname] = useState(() => {
    // Load saved nickname from localStorage
    return localStorage.getItem("flappybird_nickname") || "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [isTopTen, setIsTopTen] = useState(false);

  // Check if score qualifies for top 10 on mount
  useEffect(() => {
    async function checkRanking() {
      setLoadingRanking(true);
      try {
        const result = await getRanking();
        setRanking(result.data);

        // Check if score qualifies for top 10
        const qualifies = result.data.length < 10 ||
          score > (result.data[result.data.length - 1]?.score ?? 0);

        setIsTopTen(qualifies);

        // If not top 10, skip to ranking display
        if (!qualifies) {
          setShowRanking(true);
        }
      } catch (error) {
        console.error("Failed to load ranking:", error);
        setShowRanking(true);
      } finally {
        setLoadingRanking(false);
      }
    }

    checkRanking();
  }, [score]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || submitting) return;

    setSubmitting(true);
    try {
      const trimmedNickname = nickname.trim();
      // Save nickname to localStorage for next time
      localStorage.setItem("flappybird_nickname", trimmedNickname);
      await submitScore(trimmedNickname, score);
      await loadRanking();
      setShowRanking(true);
    } catch (error) {
      console.error("Failed to submit score:", error);
      alert("Failed to submit score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadRanking() {
    setLoadingRanking(true);
    try {
      const result = await getRanking();
      setRanking(result.data);
    } catch (error) {
      console.error("Failed to load ranking:", error);
    } finally {
      setLoadingRanking(false);
    }
  }

  function handleSkip() {
    setShowRanking(true);
  }

  useEffect(() => {
    // Prevent background scroll on mobile
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Loading state
  if (loadingRanking && !showRanking) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Game Over!</h2>
          <p style={styles.score}>Your Score: {score}</p>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Game Over!</h2>
        <p style={styles.score}>Your Score: {score}</p>

        {showRanking ? (
          <div>
            <h3 style={styles.rankingTitle}>Top 10 Ranking</h3>
            {loadingRanking ? (
              <p>Loading...</p>
            ) : ranking.length === 0 ? (
              <p style={styles.empty}>No scores yet!</p>
            ) : (
              <div style={styles.rankingContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((entry, index) => (
                      <tr
                        key={entry.id}
                        style={index < 3 ? styles.topThree : undefined}
                      >
                        <td style={styles.td}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </td>
                        <td style={styles.td}>{entry.nickname}</td>
                        <td style={styles.td}>{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button style={styles.button} onClick={onClose}>
              Play Again
            </button>
          </div>
        ) : isTopTen ? (
          <div>
            <p style={styles.congrats}>You made the Top 10!</p>
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
                <button type="button" style={styles.buttonSecondary} onClick={handleSkip}>
                  Skip
                </button>
              </div>
            </form>
          </div>
        ) : null}
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
    padding: "16px",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    width: "100%",
    maxWidth: "340px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#333",
    fontSize: "24px",
  },
  score: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#e91e63",
    margin: "0 0 16px 0",
  },
  congrats: {
    fontSize: "18px",
    color: "#4CAF50",
    fontWeight: "bold",
    margin: "0 0 16px 0",
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
    flex: 1,
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
  rankingTitle: {
    margin: "0 0 12px 0",
    color: "#333",
    fontSize: "20px",
    fontWeight: "bold",
  },
  rankingContainer: {
    maxHeight: "280px",
    overflow: "auto",
    marginBottom: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px 8px",
    textAlign: "left",
    borderBottom: "2px solid #4CAF50",
    color: "#333",
    fontSize: "15px",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "16px",
    color: "#222",
    fontWeight: "500",
  },
  topThree: {
    backgroundColor: "#fff9c4",
    fontWeight: "bold",
  },
  empty: {
    color: "#666",
    marginBottom: "16px",
  },
};
