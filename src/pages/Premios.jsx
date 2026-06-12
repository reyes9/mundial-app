import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Premios.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1051305806&single=true&output=csv";

const groupRules = [
  {
    points: "1 punto",
    text: "Por cada equipo cuyo número de goles hayas acertado exactamente.",
  },
  {
    points: "2 puntos",
    text: "Por acertar el signo del partido: 1, X o 2.",
  },
  {
    points: "10 puntos",
    text: "Por acertar el orden completo de clasificación de todos los equipos de un grupo.",
  },
];

const knockoutRules = [
  {
    points: "5 puntos",
    text: "Por acertar el número exacto de goles de cada equipo en una eliminatoria.",
    note: "Solo aplica si también has acertado los dos equipos que se enfrentan. Se cuentan los 90 minutos reglamentarios, sin prórroga ni penaltis.",
  },
  { points: "5 puntos", text: "Por cada equipo acertado en dieciseisavos de final." },
  { points: "10 puntos", text: "Por cada equipo acertado en octavos de final." },
  { points: "15 puntos", text: "Por cada equipo acertado en cuartos de final." },
  { points: "20 puntos", text: "Por cada equipo acertado en semifinales." },
  { points: "25 puntos", text: "Por cada equipo acertado en tercer y cuarto puesto." },
  { points: "30 puntos", text: "Por cada equipo acertado en la final." },
  { points: "25 puntos", text: "Por acertar el tercer clasificado del Mundial." },
  { points: "50 puntos", text: "Por acertar el campeón del Mundial." },
];

const examples = [
  "Si pronosticas México 3-2 Sudáfrica y el partido acaba 1-0, sumas 2 puntos por acertar el signo.",
  "Si acaba 3-1, sumas 3 puntos: 2 por el signo y 1 por los goles de México.",
  "Si acaba 3-2, sumas 4 puntos: 2 por el signo, 1 por los goles de México y 1 por los goles de Sudáfrica.",
  "Si acaba 2-2, sumas 1 punto por los goles de Sudáfrica.",
  "Si acaba 0-1, no sumas ningún punto.",
];

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

            {premio.descripcion && <p>{premio.descripcion}</p>}

            {premio.importe && <div className="prize-amount">{premio.importe}</div>}
          </article>
        ))}
      </div>

      <section className="rules-panel">
        <div className="rules-header">
          <span>📜 Reglamento</span>
          <h2>Cómo se puntúa la porra</h2>
          <p>El objetivo es simple: sumar más puntos que el resto y poder sacar pecho sin pudor.</p>
        </div>

        <div className="rules-grid">
          <RuleSection title="⚽ Fase de grupos" rules={groupRules} />
          <RuleSection title="🔥 Fase eliminatoria" rules={knockoutRules} />
        </div>

        <div className="example-box">
          <h3>Ejemplo rápido</h3>
          <p>
            Pronóstico inicial: <strong>México 3-2 Sudáfrica</strong>
          </p>

          <div className="example-list">
            {examples.map((example, index) => (
              <div className="example-item" key={index}>
                <span>{index + 1}</span>
                <p>{example}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="questions-rule">
          <div>
            <span>🎯 Preguntas varias</span>
            <strong>Cada pregunta tiene su propia puntuación.</strong>
          </div>
          <p>La puntuación exacta se puede consultar en la pestaña “Preguntas”.</p>
        </div>
        <div className="tie-rule">
          <span>🤝 Empates</span>

          <strong>Reparto de premios en caso de empate</strong>

          <p>
            Si dos o más participantes finalizan con la misma puntuación en una posición
            premiada, el importe correspondiente a dicha posición se repartirá a partes
            iguales entre todos los participantes empatados.
          </p>

          <p>
            Ejemplo: si tres participantes empatan en la primera posición, el premio del
            campeón se dividirá entre los tres, correspondiendo a cada uno un tercio
            del importe total.
          </p>
        </div>
      </section>
    </div>
  );
}

function RuleSection({ title, rules }) {
  return (
    <section className="rule-section">
      <h3>{title}</h3>

      <div className="rule-list">
        {rules.map((rule, index) => (
          <article className="rule-card" key={index}>
            <div className="rule-points">{rule.points}</div>
            <div>
              <p>{rule.text}</p>
              {rule.note && <small>{rule.note}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}