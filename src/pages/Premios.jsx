import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Premios.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1051305806&single=true&output=csv";

export default function Premios() {
  const [premios, setPremios] = useState([]);

  useEffect(() => {
    loadPremios();
  }, []);

  const loadPremios = async () => {
    const response = await fetch(`${CSV_URL}&cacheBust=${Date.now()}`);
    const text = await response.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row, index) => ({
        posicion: String(row["Posición"] || row["Posicion"] || row["Puesto"] || "").trim(),
        premio: String(row["Premio"] || "").trim(),
        descripcion: String(row["Descripción"] || row["Descripcion"] || "").trim(),
        importe: String(row["Importe"] || row["Cantidad"] || row["€"] || "").trim(),
        index,
      }))
      .filter((p) => p.posicion || p.premio || p.importe);

    setPremios(data);
  };

  const iconByIndex = (index) => {
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🎁";
  };

  return (
    <div className="prizes-page">
      <div className="prizes-hero">
        <h1>Premios</h1>
        <p>Porque aquí se juega por honor… y por rascar algo.</p>
      </div>

      <div className="prizes-grid">
        {premios.map((premio, index) => (
          <article className={`prize-card prize-${index + 1}`} key={premio.index}>
            <div className="prize-icon">{iconByIndex(index)}</div>

            <div className="prize-position">
              {premio.posicion || `Premio ${index + 1}`}
            </div>

            <h2>{premio.premio || "Premio pendiente"}</h2>

            {premio.descripcion && (
              <p>{premio.descripcion}</p>
            )}

            {premio.importe && (
              <div className="prize-amount">{premio.importe}</div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}