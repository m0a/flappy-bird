import { useEffect, useState } from "react";
import { getRanking } from "../lib/api";

interface RankingEntry {
  id: number;
  nickname: string;
  score: number;
  createdAt: string | null;
}

export function Ranking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    try {
      const result = await getRanking();
      setRanking(result.data);
    } catch (error) {
      console.error("Failed to load ranking:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Top 10 Ranking</h2>
      {ranking.length === 0 ? (
        <p style={styles.empty}>No scores yet. Be the first!</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry, index) => (
              <tr key={entry.id} style={index < 3 ? styles.topThree : {}}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{entry.nickname}</td>
                <td style={styles.td}>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    width: "100%",
    maxWidth: "300px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 16px 0",
    textAlign: "center",
    color: "#333",
  },
  empty: {
    textAlign: "center",
    color: "#666",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    color: "#333",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
  },
  topThree: {
    backgroundColor: "#fff9c4",
  },
};
