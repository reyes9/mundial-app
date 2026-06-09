import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Grupos.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1922931318&single=true&output=csv";

export default function Grupos() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const toNumber = (value) => Number(String(value || "0").replace(",", "."));

  const loadGroups = async () => {
    const response = await fetch(`${CSV_URL}&cacheBust=${Date.now()}`);
    const text = await response.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        grupo: String(row["Grupo"] || "").trim(),
        posicionManual: toNumber(row["Posición"]),
        equipo: String(row["Equipo"] || "").trim(),
        estado: String(row["Estado"] || "").trim(),
        pj: toNumber(row["PJ"]),
        g: toNumber(row["G"]),
        e: toNumber(row["E"]),
        p: toNumber(row["P"]),
        gf: toNumber(row["GF"]),
        gc: toNumber(row["GC"]),
        dg: toNumber(row["DG"]),
        pts: toNumber(row["Pts"]),
      }))
      .filter((team) => team.grupo && team.equipo);

    setTeams(data);
  };

  const groupedTeams = teams.reduce((acc, team) => {
    if (!acc[team.grupo]) acc[team.grupo] = [];

    acc[team.grupo].push(team);

    acc[team.grupo].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      if (a.gc !== b.gc) return a.gc - b.gc;
      return a.posicionManual - b.posicionManual;
    });

    return acc;
  }, {});

  const getRowClass = (index) => {
    if (index <= 1) return "qualified";
    if (index === 2) return "third-place";
    return "";
  };

  return (
    <div className="groups-page">
      <div className="groups-header">
        <div>
          <h1>Grupos</h1>
          <p>Clasificación actual · Mundial 2026</p>
        </div>
      </div>

      <div className="classification-grid">
        {Object.entries(groupedTeams).map(([group, groupTeams]) => (
          <section className="classification-card" key={group}>
            <div className="classification-title">Grupo {group}</div>

            <div className="table-scroll">
                <table className="classification-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>G</th>
                        <th>E</th>
                        <th>P</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DG</th>
                        <th>Pts</th>
                    </tr>
                    </thead>

                    <tbody>
                    {groupTeams.map((team, index) => (
                        <tr key={team.equipo} className={getRowClass(index)}>
                        <td>{index + 1}</td>
                        <td className="team-name">
                            <span>{team.equipo}</span>
                            {team.estado && <small>{team.estado}</small>}
                        </td>
                        <td>{team.pj}</td>
                        <td>{team.g}</td>
                        <td>{team.e}</td>
                        <td>{team.p}</td>
                        <td>{team.gf}</td>
                        <td>{team.gc}</td>
                        <td>{team.dg}</td>
                        <td className="points">{team.pts}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

            <div className="classification-legend">
              <span><b className="green-dot" /> Clasifica</span>
              <span><b className="yellow-dot" /> Posible mejor tercero</span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}