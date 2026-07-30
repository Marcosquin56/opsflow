"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("No se pudo conectar con el backend");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="modal auth-card">
        <header>
          <div>
            <span className="panel-kicker">OpsFlow</span>
            <h2>Iniciar sesión</h2>
          </div>
        </header>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              autoFocus
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vos@ejemplo.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <footer>
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </footer>
        </form>
        <p className="form-note auth-hint">
          Demo: administrador@opsflow.dev · analista@opsflow.dev ·
          solicitante@opsflow.dev — contraseña <strong>opsflow123</strong>
        </p>
      </div>
    </div>
  );
}
