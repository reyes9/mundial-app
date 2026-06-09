import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./FaseFinal.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1186413051&single=true&output=csv";

const normalize = (value) => String(value || "").trim();

export default function FaseFinal() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
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

  const byRound = (round) => matches.filter((m) => m.ronda === round);

  const dieciseisavos = byRound("Dieciseisavos");
  const octavos = byRound("Octavos");
  const cuartos = byRound("Cuartos");
  const semis = byRound("Semifinales");
  const final = byRound("Final")[0];
  const thirdPlace =
    byRound("Tercer y cuarto")[0] ||
    byRound("Tercer puesto")[0] ||
    byRound("Tercer y cuarto")[0];

  return (
    <div className="bracket-page">
      <h1>Fase final</h1>
      <p>Cuadro eliminatorio · Mundial 2026</p>

      <div className="bracket-scroll">
        <div className="bracket-board">
          <BracketColumn title="Dieciseisavos" matches={dieciseisavos.slice(0, 8)} />
          <BracketColumn title="Octavos" matches={octavos.slice(0, 4)} offset />
          <BracketColumn title="Cuartos" matches={cuartos.slice(0, 2)} offsetLarge />
          <BracketColumn title="Semifinal" matches={semis.slice(0, 1)} offsetXL />

          <div className="center-column">
            <h3>Final</h3>
            {final && <MatchCard match={final} featured />}
            <h3 className="third-title">3º y 4º puesto</h3>
            {thirdPlace && <MatchCard match={thirdPlace} />}
          </div>

          <BracketColumn title="Semifinal" matches={semis.slice(1, 2)} offsetXL />
          <BracketColumn title="Cuartos" matches={cuartos.slice(2, 4)} offsetLarge />
          <BracketColumn title="Octavos" matches={octavos.slice(4, 8)} offset />
          <BracketColumn title="Dieciseisavos" matches={dieciseisavos.slice(8, 16)} />
        </div>
      </div>
    </div>
  );
}

function BracketColumn({ title, matches, offset, offsetLarge, offsetXL }) {
  let className = "bracket-column";
  if (offset) className += " offset";
  if (offsetLarge) className += " offset-large";
  if (offsetXL) className += " offset-xl";

  return (
    <section className={className}>
      <h2>{title}</h2>
      <div className="column-matches">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

function MatchCard({ match, featured }) {
  const hasResult = match.golesLocal !== "" && match.golesVisitante !== "";

  return (
    <article className={featured ? "bracket-card featured" : "bracket-card"}>
      <div className="card-meta">
        <span>{match.fecha}</span>
        <span>{match.hora}</span>
      </div>

      <div className="team-line">
        <span>{match.local}</span>
        <strong>{hasResult ? match.golesLocal : ""}</strong>
      </div>

      <div className="team-line">
        <span>{match.visitante}</span>
        <strong>{hasResult ? match.golesVisitante : ""}</strong>
      </div>

      <div className="card-footer">
        {match.id}
      </div>
    </article>
  );
}