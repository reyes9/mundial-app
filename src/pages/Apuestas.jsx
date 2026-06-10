import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Apuestas.css";

const RANKING_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1992439699&single=true&output=csv";

const QUESTION_TEXTS = [
  "¿Qué selección marcará el primer gol del Mundial?",
  "¿De qué selección será la primera tarjeta amarilla del Torneo?",
  "¿De qué selección será la primera tarjeta roja del Torneo?",
  "¿Habrá algún gol en propia porteria?",
  "¿Quién marcará más goles en el Mundial: Cristiano o Messi?",
  "¿Quén marcará más goles en el Mundial: Mbappe o Kane?",
  "¿Recibirá alguna tarjeta Rudiger?",
  "¿Jugará algún minuto Tim Payne?",
  "¿Quién llegará más lejos: México, Estados Unidos o Canada?",
  "¿Marcará algún gol Endrick?",

  "¿Qué selección marcará más goles en Fase de Grupos?",
  "¿Qué selección recibirá más goles en Fase de Grupos?",
  "¿Cuántos partidos terminarán 0-0 en Fase de Grupos: 0-3 o más de tres?",
  "¿Qué selección recibirá más tarjetas amarillas en Fase de Grupos?",
  "¿Habrá algún triple empate en la clasificación?",

  "¿Habrá penalties en Cuartos de Final?",
  "¿Habrá algún Hat-trick en la Fase Final?",
  "¿Habrá tanda de penalties en Cuartos de Final?",
  "¿Llegará algún equipo africano a Semifinales?",
  "¿Se decidirá alguna Semifinal por penalties?",
  "¿Llegará algún equipo americano a la Final?",
  "¿Cuántos goles habrá en la final de cosolación: 0-3 o más de 3?",
  "¿Habrá alguna expulsión en la final?",
  "¿La final se deciriá: en primeros 90 minutos, prorroga, penalties?",
  "¿Quién será el mejor jugador de la final según FIFA?",

  "¿Quién marcará el primer gol de España?",
  "¿Cuántos goles marcará Lamine Yamal: menos de 2, entre 2 y 5, más de 5?",
  "¿Acabará invicta España en Fase de Grupos?",
  "¿Jugará algún minuto Joan Garcia?",
  "¿Jugará algún minuto Victor Muñoz?",
  "¿Será titular Gavi en algún partido?",
  "¿Marcará Pedri en algún partido?",
  "¿Marcará algún gol de cabeza España?",
  "¿España pasará de Cuartos de Final?",
  "¿Quén será el máximo goleador de España?",
];

export default function Apuestas() {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState("");
  const [hasSelectedPlayer, setHasSelectedPlayer] = useState(false);
  const [bets, setBets] = useState({
    matches: [],
    standings: [],
    knockout: [],
    questions: [],
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    const player = players.find((p) => p.participante === selected);
    if (player?.csv) loadBets(player.csv);
  }, [selected, players]);

  const loadPlayers = async () => {
    const res = await fetch(`${RANKING_CSV}&cacheBust=${Date.now()}`);
    const text = await res.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        posicion: String(row["Posición"] || row["Posicion"] || "").trim(),
        participante: String(row["Participante"] || "").trim(),
        total: String(row["Total"] || "0").trim(),
        partidos: String(row["Partidos"] || "0").trim(),
        clasificacion: String(row["Clasificación"] || row["Clasificacion"] || "0").trim(),
        preguntas: String(row["Preguntas"] || "0").trim(),
        csv: String(row["CSV"] || row["Apuestas"] || "").trim(),
      }))
      .filter((p) => p.participante && p.csv);

    setPlayers(data);
  };

  const loadBets = async (csvUrl) => {
    const res = await fetch(`${csvUrl}&cacheBust=${Date.now()}`);
    const text = await res.text();

    const parsed = Papa.parse(text, {
        skipEmptyLines: false,
    });

    const allRows = parsed.data
        .map((row) => row.map((cell) => String(cell || "").trim()));

    const rows = allRows.slice(1);

    const matches = rows
        .map((row) => ({
        local: row[1],
        visitante: row[2],
        golesLocal: row[3],
        golesVisitante: row[4],
        signo: row[5],
        }))
        .filter((m) => m.local && m.visitante);

    let lastGroup = "";

    const standings = rows
        .map((row) => {
        if (row[7]) lastGroup = row[7];

        return {
            grupo: lastGroup,
            posicion: row[8],
            equipo: row[9],
        };
        })
        .filter((s) => s.grupo && s.posicion && s.equipo)
        .sort((a, b) => {
        if (a.grupo !== b.grupo) return a.grupo.localeCompare(b.grupo);
        return Number(a.posicion) - Number(b.posicion);
        });

    const knockoutRaw = allRows
        .map((row) => ({
            cruce: row[11],
            equipo: row[12],
            goles: row[13],
        }))
        .filter(
            (k) =>
            k.cruce &&
            k.equipo &&
            k.cruce.toLowerCase() !== "cruce" &&
            k.equipo.toLowerCase() !== "equipo"
        );

    const knockout = [];
    let tercero = "";
    let ganador = "";

    for (let i = 0; i < knockoutRaw.length; i++) {
        const current = knockoutRaw[i];

        if (current.cruce === "Tercero") {
            tercero = current.equipo;
            continue;
        }

        if (current.cruce === "Ganador") {
            ganador = current.equipo;
            continue;
        }

        const next = knockoutRaw[i + 1];

        if (next && next.cruce === current.cruce) {
            knockout.push({
            cruce: current.cruce,
            equipoA: current.equipo,
            golesA: current.goles,
            equipoB: next.equipo,
            golesB: next.goles,
            });

            i++;
        }
    }

    const questions = rows
        .map((row) => ({
        id: row[15],
        respuesta: row[16],
        }))
        .filter((q) => q.id && q.respuesta)
        .map((q, index) => ({
        pregunta: QUESTION_TEXTS[index] || `Pregunta ${q.id}`,
        respuesta: q.respuesta,
        }));

    setBets({
        matches,
        standings,
        knockout,
        tercero,
        ganador,
        questions,
        });
    };

  const currentPlayer = players.find((p) => p.participante === selected);

  return (
    <div className="bets-page">
      <div className="bets-hero">
        <div>
          <h1>Apuestas</h1>
          <p>Perfil FIFA de cada participante. Aquí empieza el salseo.</p>
        </div>

        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setHasSelectedPlayer(Boolean(e.target.value));
          }}
        >
          <option value="">Selecciona participante</option>

          {players.map((player) => (
            <option key={player.participante} value={player.participante}>
              {player.participante}
            </option>
          ))}
        </select>
      </div>

      {!hasSelectedPlayer && (
        <section className="bets-empty-state">
          <div className="empty-icon">🎟️</div>
          <h2>Elige una apuesta para cotillear</h2>
          <p>
            Selecciona un participante y verás su perfil, sus predicciones y
            todas las barbaridades futbolísticas que ha dejado por escrito.
          </p>
        </section>
      )}

      {hasSelectedPlayer && currentPlayer && (
        <>
          <section className="player-card">
            <div className="avatar-ball">⚽</div>

            <div className="player-info">
              <span>Participante</span>
              <h2>{currentPlayer.participante}</h2>
              <p>Posición actual #{currentPlayer.posicion || "-"}</p>
            </div>

            <div className="player-score">
              <strong>{currentPlayer.total}</strong>
              <span>PTS</span>
            </div>

            <div className="player-stats">
              <div>
                <strong>{currentPlayer.partidos}</strong>
                <span>Partidos</span>
              </div>
              <div>
                <strong>{currentPlayer.clasificacion}</strong>
                <span>Clasificación</span>
              </div>
              <div>
                <strong>{currentPlayer.preguntas}</strong>
                <span>Preguntas</span>
              </div>
            </div>
          </section>

          <section className="bets-grid">
            <BetBlock title="⚽ Partidos" count={bets.matches.length}>
              <div className="match-bets-list">
                {bets.matches.map((match, index) => (
                  <article className="bet-match-card" key={index}>
                    <div className="bet-team">{match.local}</div>
                    <div className="bet-score">
                      {match.golesLocal} - {match.golesVisitante}
                    </div>
                    <div className="bet-team right">{match.visitante}</div>
                    <div className="bet-sign">Signo: {match.signo || "-"}</div>
                  </article>
                ))}
              </div>
            </BetBlock>

            <BetBlock title="🏆 Clasificación grupos" count={bets.standings.length}>
              <div className="standings-bets">
                {Object.entries(groupBy(bets.standings, "grupo")).map(
                  ([grupo, items]) => (
                    <div className="standing-card" key={grupo}>
                      <h3>Grupo {grupo}</h3>
                      {items.map((item, index) => (
                        <div className="standing-row" key={index}>
                          <span>{item.posicion}</span>
                          <strong>{item.equipo}</strong>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </BetBlock>

            <BetBlock title="🔥 Fase final" count={bets.knockout.length}>
                <div className="final-highlights">
                    {bets.ganador && (
                    <div className="final-highlight-card winner">
                        <span>🏆 Campeón</span>
                        <strong>{bets.ganador}</strong>
                    </div>
                    )}
                    {bets.tercero && (
                    <div className="final-highlight-card">
                        <span>🥉 Tercer puesto</span>
                        <strong>{bets.tercero}</strong>
                    </div>
                    )}
                </div>

                <div className="knockout-bets">
                    {bets.knockout.map((match, index) => (
                    <article className="ko-bet-card" key={index}>
                        <div className="ko-title">{match.cruce}</div>
                        <div className="ko-line">
                        <span>{match.equipoA}</span>
                        <strong>{match.golesA}</strong>
                        </div>
                        <div className="ko-line">
                        <span>{match.equipoB}</span>
                        <strong>{match.golesB}</strong>
                        </div>
                    </article>
                    ))}
                </div>
            </BetBlock>

            <BetBlock title="🎯 Preguntas" count={bets.questions.length}>
              <div className="question-bets">
                {bets.questions.map((item, index) => (
                  <article className="question-bet-card" key={index}>
                    <span>{item.pregunta}</span>
                    <strong>{item.respuesta}</strong>
                  </article>
                ))}
              </div>
            </BetBlock>
          </section>
        </>
      )}
    </div>
  );
}

function BetBlock({ title, count, children }) {
  return (
    <section className="bet-block">
      <div className="bet-block-header">
        <h2>{title}</h2>
        <span>{count}</span>
      </div>
      {children}
    </section>
  );
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Otros";
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}