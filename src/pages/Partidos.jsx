import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Partidos.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=0&single=true&output=csv";

export default function Partidos() {
  const [matches, setMatches] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("Todos");

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
        grupo: String(row["Grupo"] || "").trim(),
        fecha: String(row["Fecha"] || "").trim(),
        hora: String(row["Hora"] || "").trim(),
        ciudad: String(row["Ciudad Sede"] || "").trim(),
        estadio: String(row["Estadio"] || "").trim(),
        local: String(row["Local"] || "").trim(),
        golesLocal: String(row["Goles Local"] || "").trim(),
        golesVisitante: String(row["Goles Visitante"] || "").trim(),
        visitante: String(row["Visitante"] || "").trim(),
      }))
      .filter((match) => match.grupo && match.local && match.visitante);

    setMatches(data);
  };

  const groups = ["Todos", ...new Set(matches.map((m) => m.grupo))];

  const filteredMatches =
    selectedGroup === "Todos"
      ? matches
      : matches.filter((m) => m.grupo === selectedGroup);

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    if (!acc[match.grupo]) acc[match.grupo] = [];
    acc[match.grupo].push(match);
    return acc;
  }, {});

  const hasResult = (match) =>
    match.golesLocal !== "" && match.golesVisitante !== "";

  return (
    <div className="matches-page">
      <div className="matches-header">
        <div>
          <h1>Partidos</h1>
          <p>Mundial 2026 · Fase de grupos</p>
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group === "Todos" ? "Todos los grupos" : `Grupo ${group}`}
            </option>
          ))}
        </select>
      </div>

      <div className="groups-grid">
        {Object.entries(groupedMatches).map(([group, groupMatches]) => (
          <section className="group-card" key={group}>
            <div className="group-title">Grupo {group}</div>

            {groupMatches.map((match, index) => (
              <article className="match-card" key={`${group}-${index}`}>
                <div className="match-meta">
                  <span>{match.fecha}</span>
                  <span>{match.hora}</span>
                </div>

                <div className="match-main">
                  <div className="team team-local">{match.local}</div>

                  <div className={hasResult(match) ? "score played" : "score"}>
                    {hasResult(match)
                      ? `${match.golesLocal} - ${match.golesVisitante}`
                      : "vs"}
                  </div>

                  <div className="team team-away">{match.visitante}</div>
                </div>

                <div className="match-location">
                  {match.ciudad} · {match.estadio}
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}