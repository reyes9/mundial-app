import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Preguntas.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd4VJYfJrM5WCnSdXrNnQLT9OFh_edPkLDQ9a82l7_wtWuyuCQ3MmbQW1ys8fDIVtABtCEs1CSKxZF/pub?gid=1076951485&single=true&output=csv";

export default function Preguntas() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const response = await fetch(`${CSV_URL}&cacheBust=${Date.now()}`);
    const text = await response.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsed.data
      .map((row) => ({
        seccion: String(row["Seccion"] || "").trim(),
        numero: String(row["Num. pregunta"] || "").trim(),
        pregunta: String(row["Pregunta"] || row["Preguna"] || "").trim(),
        puntos: String(row["Puntos"] || "").trim(),
        respuesta: String(row["Respuesta"] || "").trim(),
      }))
      .filter((q) => q.seccion && q.pregunta);

    setQuestions(data);
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.seccion]) acc[q.seccion] = [];
    acc[q.seccion].push(q);
    return acc;
  }, {});

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1>Preguntas</h1>
        <p>Sección para demostrar quién sabe de fútbol</p>
      </div>

      <div className="questions-grid">
        {Object.entries(groupedQuestions).map(([section, items]) => (
          <section className="question-section" key={section}>
            <div className="section-title">{section}</div>

            {items.map((item) => (
              <article className="question-card" key={`${section}-${item.numero}`}>
                <div className="question-top">
                  <span>Pregunta {item.numero}</span>
                  <div className="points-badge">
                    🏆 {item.puntos}
                  </div>
                </div>

                <div className="question-text">{item.pregunta}</div>

                <div className={item.respuesta ? "answer answered" : "answer"}>
                    {item.respuesta ? (
                        <>
                        ✅ {item.respuesta}
                        </>
                    ) : (
                        <>
                        ⏳ Pendiente
                        </>
                    )}
                    </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}