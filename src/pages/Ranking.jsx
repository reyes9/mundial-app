import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Ranking.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1992439699&single=true&output=csv";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    const response = await fetch(`${CSV_URL}&cacheBust=${Date.now()}`);
    const text = await response.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        posicion: String(row["Posición"] || row["Posicion"] || "").trim(),
        participante: String(row["Participante"] || "").trim(),
        total: Number(row["Total"] || 0),
        partidos: Number(row["Partidos"] || 0),
        clasificacion: Number(row["Clasificación"] || row["Clasificacion"] || 0),
        preguntas: Number(row["Preguntas"] || 0),
      }))
      .filter((item) => item.participante)
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        ...item,
        posicion: index + 1,
      }));

    setRanking(data);
  };

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const getMedal = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "⚽";
  };

  return (
    <div className="ranking-page">
      <div className="ranking-hero">
        <div>
          <h1>Ranking</h1>
          <p>La gloria, la humillación y los lloros en una sola tabla.</p>
        </div>

        <div className="ranking-live">
          <span className="live-dot"></span>
          Actualizado desde Google Sheets
        </div>
      </div>

      <section className="podium">
        {podium.map((player) => (
          <article
            key={player.participante}
            className={`podium-card position-${player.posicion}`}
          >
            <div className="medal">{getMedal(player.posicion)}</div>
            <div className="podium-position">#{player.posicion}</div>
            <h2>{player.participante}</h2>
            <div className="big-score">{player.total}</div>
            <span>puntos</span>

            <div className="score-breakdown">
              <div>
                <strong>{player.partidos}</strong>
                <small>Partidos</small>
              </div>
              <div>
                <strong>{player.clasificacion}</strong>
                <small>Clasificación</small>
              </div>
              <div>
                <strong>{player.preguntas}</strong>
                <small>Preguntas</small>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="ranking-table-card">
        <div className="table-title">
          <h2>Clasificación general</h2>
          <span>{ranking.length} participantes</span>
        </div>

        <div className="ranking-list">
          {ranking.map((player) => (
            <div
              key={player.participante}
              className={`ranking-row ${
                player.posicion <= 3 ? "top-player" : ""
              }`}
            >
              <div className="rank-position">
                {getMedal(player.posicion)}
                <strong>#{player.posicion}</strong>
              </div>

              <div className="player-name">{player.participante}</div>

              <div className="mini-stats">
                <span>⚽ {player.partidos}</span>
                <span>📊 {player.clasificacion}</span>
                <span>🎯 {player.preguntas}</span>
              </div>

              <div className="total-points">
                <strong>{player.total}</strong>
                <small>pts</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}