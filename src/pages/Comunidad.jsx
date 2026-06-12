import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Comunidad.css";

const COMMUNITY_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1992439699&single=true&output=csv";
const MATCHES_STATUS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1215895559&single=true&output=csv";

const BLOCKS = [
  {
    key: "campeon",
    title: "🏆 Campeón del Mundial",
    subtitle: "Aquí se separan visionarios de vendehumos",
    columnNames: ["Campeon", "Campeón"],
  },
  {
    key: "goleador",
    title: "🐐 Cristiano vs Messi",
    subtitle: "El debate que nunca muere",
    columnNames: ["Goleador"],
  },
  {
    key: "goleadorEsp",
    title: "🇪🇸 Pichichi de España",
    subtitle: "Donde aparece el seleccionador de sofá",
    columnNames: ["GoleadorEsp", "Goleador España", "GoleadorEspana"],
  },
  {
    key: "roja",
    title: "⭐ El Expediente Tim Payne",
    subtitle: "Un país entero espera. Tu porra también.",
    columnNames: ["Roja"],
  },
];



export default function Comunidad() {
  const [rows, setRows] = useState([]);
  const [matchStatus, setMatchStatus] = useState({
    live: [],
    next: [],
    });
  useEffect(() => {
    loadCommunity();
    loadMatchStatus();
  }, []);

  const loadCommunity = async () => {
    const res = await fetch(`${COMMUNITY_CSV}&cacheBust=${Date.now()}`);
    const text = await res.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        participante: String(row["Participante"] || "").trim(),
        campeon: getColumn(row, ["Campeon", "Campeón"]),
        goleador: getColumn(row, ["Goleador"]),
        goleadorEsp: getColumn(row, ["GoleadorEsp", "Goleador España", "GoleadorEspana"]),
        roja: getColumn(row, ["Roja"]),
      }))
      .filter((r) => r.participante);

    setRows(data);
  };

  const loadMatchStatus = async () => {
    const res = await fetch(`${MATCHES_STATUS_CSV}&cacheBust=${Date.now()}`);
    const text = await res.text();

    const parsed = Papa.parse(text, {
        skipEmptyLines: false,
    });

    const rows = parsed.data.map((row) =>
        row.map((cell) => String(cell || "").trim())
    );

    const live = [];
    const next = [];
    let section = "";

    rows.forEach((row) => {
        const first = row[0];

        if (first.includes("EN JUEGO")) {
        section = "live";
        return;
        }

        if (first.includes("PRÓXIMOS") || first.includes("PROXIMOS")) {
        section = "next";
        return;
        }

        if (!first || first.toLowerCase().includes("no hay partidos")) return;

        const match = {
        local: row[0],
        golesLocal: row[1],
        golesVisitante: row[2],
        visitante: row[3],
        fecha: row[4],
        estado: row[5],
        };

        if (!match.local || !match.visitante) return;

        if (section === "live") live.push(match);
        if (section === "next") next.push(match);
    });

    setMatchStatus({
        live,
        next: next.slice(0, 3),
    });
    };

  return (
    <div className="community-page">
      <section className="community-hero">
        <div>
          <span className="community-kicker">🔥 El Termómetro</span>
          <h1>🎙️ Los Expertos Han Hablado</h1>
          <p>
            Consensos, apuestas raras y decisiones futbolísticas que deberían
            pasar por comité.
          </p>
        </div>
      </section>

      <MatchStatusBlock live={matchStatus.live} next={matchStatus.next} />

      <section className="community-grid">
        {BLOCKS.map((block) => (
          <CommunityBlock key={block.key} block={block} rows={rows} />
        ))}
      </section>

      <UniqueBets rows={rows} />
    </div>
  );
}

function CommunityBlock({ block, rows }) {
  const answers = rows
    .map((row) => ({
      participante: row.participante,
      respuesta: row[block.key],
    }))
    .filter((item) => item.respuesta);

  const grouped = groupAnswers(answers);
  const sorted = Object.entries(grouped).sort(
    ([, a], [, b]) => b.length - a.length
    );

    const normalAnswers = sorted.filter(
    ([, people]) => people.length > 1
    );

    const uniqueAnswers = sorted.filter(
    ([, people]) => people.length === 1
    );

  const total = answers.length;
  const top = sorted[0];
  const unique = sorted.filter(([, people]) => people.length === 1);

  return (
    <article className="community-card">
      <div className="community-card-header">
        <div>
          <h2>{block.title}</h2>
          <p>{block.subtitle}</p>
        </div>
        <span>{total} votos</span>
      </div>

      {top && (
        <div className="top-answer">
          <span>Respuesta más votada</span>
          <strong>{top[0]}</strong>
          <small>
            {top[1].length} participante{top[1].length !== 1 ? "s" : ""}
          </small>
        </div>
      )}

      <div className="answer-bars">
      {normalAnswers.map(([answer, people]) => {
          const percent = total ? Math.round((people.length / total) * 100) : 0;

          return (
            <div className="answer-bar" key={answer}>
              <div className="answer-bar-top">
                <strong>{answer}</strong>
                <span>{people.length}</span>
              </div>

              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percent}%` }} />
              </div>

              <div className="people-list">
                😈 Equipo: {people.join(", ")}
              </div>
            </div>
          );
        })}
      </div>

      {uniqueAnswers.length > 0 && (
        <div className="unique-box">
          <h3>🚨 Fuente: Tiene un Pálpito</h3>
          <p>Nivel de confianza: 100%. Nivel de pruebas: 0%</p>

          {uniqueAnswers.map(([answer, people]) => (
            <div className="unique-row" key={answer}>
              <strong>{answer}</strong>
              <span>{people[0]}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function UniqueBets({ rows }) {
  const allUnique = [];

  BLOCKS.forEach((block) => {
    const answers = rows
      .map((row) => ({
        participante: row.participante,
        respuesta: row[block.key],
      }))
      .filter((item) => item.respuesta);

    const grouped = groupAnswers(answers);

    Object.entries(grouped).forEach(([answer, people]) => {
      if (people.length === 1) {
        allUnique.push({
          category: block.title,
          answer,
          participant: people[0],
        });
      }
    });
  });

  if (!allUnique.length) return null;

  return (
    <section className="tribunal">
      <div className="tribunal-header">
        <h2>🧨 Tribunal de expertos</h2>
        <p>Las apuestas únicas. Algunas son visión. Otras, una llamada de atención.</p>
      </div>

      <div className="tribunal-grid">
        {allUnique.map((item, index) => (
          <article className="tribunal-card" key={index}>
            <span>{item.category}</span>
            <strong>{item.answer}</strong>
            <p>Autor intelectual: {item.participant}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function getColumn(row, names) {
  for (const name of names) {
    if (row[name] !== undefined) return String(row[name] || "").trim();
  }

  return "";
}

function groupAnswers(items) {
  return items.reduce((acc, item) => {
    const key = normalizeAnswer(item.respuesta);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.participante);
    return acc;
  }, {});
}

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function MatchStatusBlock({ live, next }) {
  return (
    <section className="match-status-strip">
      {live.length > 0 && (
        <div className="status-mini-block live-mini-block">
          <div className="status-mini-title">
            <strong>🔥 En juego</strong>
            <span>{live.length}</span>
          </div>

          <div className="mini-match-list">
            {live.map((match, index) => (
              <MiniMatchLive key={index} match={match} live />
            ))}
          </div>
        </div>
      )}

      <div className="status-mini-block">
        <div className="status-mini-title">
          <strong>⏭️ Próximos partidos</strong>
          <span>{next.length}</span>
        </div>

        <div className="mini-match-list">
          {next.map((match, index) => (
            <MiniMatch key={index} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniMatch({ match, live }) {
  return (
    <article className={live ? "mini-match live" : "mini-match"}>
      <div className="mini-match-score">
        <strong>{match.local}</strong>
        <span>{match.golesLocal} - {match.golesVisitante}</span>
        <strong>{match.visitante}</strong>
      </div>
      <small>{match.fecha}</small>
    </article>
  );
}
function MiniMatchLive({ match, live }) {
  return (
    <article className={live ? "mini-match live" : "mini-match"}>
      <div className="mini-match-score">
        <strong>{match.local}</strong>
        <span>{match.golesLocal} - {match.golesVisitante}</span>
        <strong>{match.visitante}</strong>
      </div>
    </article>
  );
}