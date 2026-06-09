import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./FinalSeparado.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1186413051&single=true&output=csv";

const roundsOrder = [
  "Dieciseisavos",
  "Octavos",
  "Cuartos",
  "Semifinales",
  "Final",
  "Tercer y cuarto",
];

export default function FaseFinal() {
  const [matches, setMatches] = useState([]);
  const [activeRound, setActiveRound] = useState("Dieciseisavos");

  useEffect(() => {
    loadKnockout();
  }, []);

  const loadKnockout = async () => {
    const response = await fetch(`${CSV_URL}&cacheBust=${Date.now()}`);
    const text = await response.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        ronda: String(row["Ronda"] || "").trim(),
        fecha: String(row["Fecha"] || "").trim(),
        hora: String(row["Hora"] || "").trim(),
        // partido: String(row["Partido"] || "").trim(),
        local: String(row["Equipo 1"] || "").trim(),
        golesLocal: String(row["Goles 1"] || "").trim(),
        golesVisitante: String(row["Goles 2"] || "").trim(),
        visitante: String(row["Equipo 2"] || "").trim(),
        // sede: String(row["Sede"] || row["Ciudad Sede"] || "").trim(),
        // estadio: String(row["Estadio"] || "").trim(),
      }))
      .filter((m) => m.ronda && m.local && m.visitante);

    setMatches(data);
  };

  const availableRounds = roundsOrder.filter((round) =>
    matches.some((m) => m.ronda === round)
  );

  const visibleMatches = matches.filter((m) => m.ronda === activeRound);

  const hasResult = (match) =>
    match.golesLocal !== "" && match.golesVisitante !== "";

  return (
    <div className="fifa-page">
      <div className="fifa-header">
        <h1>Fase final</h1>
        <p>Mundial 2026 · Cuadro eliminatorio</p>
      </div>

      <div className="round-tabs">
        {availableRounds.map((round) => (
          <button
            key={round}
            className={activeRound === round ? "active" : ""}
            onClick={() => setActiveRound(round)}
          >
            {round}
          </button>
        ))}
      </div>

      <div className="fifa-matches">
        {visibleMatches.map((match, index) => (
          <article className="fifa-match-card" key={`${match.ronda}-${index}`}>
            <div className="match-top">
              <span>{match.partido || `Partido ${index + 1}`}</span>
              <span>
                {match.fecha} · {match.hora}
              </span>
            </div>

            <div className="teams-row">
              <div className="team-name">{match.local}</div>

              <div className={hasResult(match) ? "result played" : "result"}>
                {hasResult(match)
                  ? `${match.golesLocal} - ${match.golesVisitante}`
                  : "vs"}
              </div>

              <div className="team-name right">{match.visitante}</div>
            </div>

            <div className="match-bottom">
              {[match.sede, match.estadio].filter(Boolean).join(" · ")}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}