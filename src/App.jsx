import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="project-title">
        <p className="eyebrow">Evaluacion React + Firebase</p>
        <h1 id="project-title">Mini Banco Digital</h1>
        <ul>
          <li>React configurado correctamente.</li>
          <li>Firebase pendiente de conectar desde <code>.env</code>.</li>
          <li>Ninguna funcionalidad bancaria implementada todavia.</li>
        </ul>
      </section>
    </main>
  )
}

export default App
