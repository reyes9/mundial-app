import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Papa from 'papaparse'
import { SHEETS } from './config/sheets'
import { AUTH } from './config/auth'
import './styles.css'
import Partidos from './pages/Partidos'
import Grupos from './pages/Grupos'
import FaseFinal from './pages/FaseFinal'
import FaseFinalSeparado from './pages/FinalSeparado'
import Preguntas from './pages/Preguntas'
import Clasificacion from './pages/Ranking'
import Premios from './pages/Premios'
import Apuestas from './pages/Apuestas'
import Comunidad from './pages/Comunidad'

const tabs = [
  { id: 'community', label: '🌶️ Comunidad' },
  { id: 'matches', label: '🏠 Partidos' },
  { id: 'groups', label: '🏆 Grupos' },
  { id: 'knockout', label: '🎯 Fase final' },
  { id: 'knockout-separado', label: '🎯 Fase final Detalle' },
  { id: 'questions', label: '❓ Preguntas' },
  { id: 'ranking', label: '📊 Ranking' },
  { id: 'apuestas', label: '🏆 Apuestas' },
  { id: 'prizes', label: '🎁 Premios' },
]

function cleanRows(rows) {
  return rows
    .map(row => row.map(cell => String(cell ?? '').trim()))
    .filter(row => row.some(cell => cell !== ''))
}

async function fetchCsv(url) {
  const res = await fetch(`${url}&cacheBust=${Date.now()}`)
  if (!res.ok) throw new Error('No se ha podido actualizar')
  const text = await res.text()
  const parsed = Papa.parse(text, { skipEmptyLines: false })
  return cleanRows(parsed.data || [])
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = e => {
    e.preventDefault()
    if (username === AUTH.username && password === AUTH.password) {
      localStorage.setItem('porra-auth', 'ok')
      onLogin()
      return
    }
    setError('Usuario o contraseña incorrectos')
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="badge">Mundial 2026</div>
        <h1>VARbaridad 2026</h1>
        <p>Acceso privado para ver partidos, preguntas y clasificación.</p>
        <input placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <span className="error">{error}</span>}
        <button>Entrar</button>
      </form>
    </main>
  )
}

function CsvTable({ title, rows }) {
  if (!rows.length) return <div className="empty">Sin datos todavía.</div>
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>{rows.length} líneas</span>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i === 0 ? 'header-row' : ''}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function App() {
  const [isLogged, setIsLogged] = useState(localStorage.getItem('porra-auth') === 'ok')
  const [active, setActive] = useState('community')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLogged) return
    if (active === 'matches' || active === 'groups' || active === 'knockout' || 
      active === 'knockout-separado' || active === 'questions' || active === 'ranking'|| 
      active === 'prizes' || active === 'apuestas' || active === 'community') return

    setLoading(true)
    setError('')

    fetchCsv(SHEETS[active])
      .then(rows => setData(prev => ({ ...prev, [active]: rows })))
      .catch(() => setError('No se han podido cargar los datos. Avisa al admin del grupo.'))
      .finally(() => setLoading(false))
  }, [active, isLogged])

  if (!isLogged) return <Login onLogin={() => setIsLogged(true)} />

  const logout = () => {
    localStorage.removeItem('porra-auth')
    setIsLogged(false)
  }

  const title = tabs.find(t => t.id === active)?.label

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <strong>VARbaridad 2026</strong>
          <small>El Chiringuito Mundial</small>
        </div>
        <button className="ghost" onClick={logout}>Salir</button>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {active === 'matches' ? (
          <Partidos />
        ) : active === 'groups' ? (
          <Grupos />
        ) : active === 'knockout' ? (
          <FaseFinal />
        ) : active === 'knockout-separado' ? (
          <FaseFinalSeparado />
        ) : active === 'questions' ? (
          <Preguntas  />
        ) : active === 'ranking' ? (
          <Clasificacion />
        ) : active === 'prizes' ? (
          <Premios />
        ) : active === 'apuestas' ? (
          <Apuestas />
        ) : active === 'community' ? (
          <Comunidad />
        ) : (
          <>
            {loading && <div className="loading">Cargando datos...</div>}
            {error && <div className="error-box">{error}</div>}
            {!loading && !error && <CsvTable title={title} rows={data[active] || []} />}
          </>
        )}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
