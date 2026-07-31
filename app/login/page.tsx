"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { name, email, password };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(
          data.error ?? (mode === "login" ? "No se pudo iniciar sesión" : "No se pudo crear la cuenta"),
        );
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
            <h2>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          </div>
        </header>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
            type="button"
          >
            Crear cuenta
          </button>
        </div>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nombre
              <input
                autoFocus
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre completo"
                required
                value={name}
              />
            </label>
          )}
          <label>
            Email
            <input
              autoFocus={mode === "login"}
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
          {mode === "register" && (
            <p className="form-note">
              Las cuentas nuevas se crean con rol Solicitante: podés cargar y
              seguir tus propias solicitudes. Los roles de Analista y
              Administrador se asignan aparte.
            </p>
          )}
          {error && <p className="auth-error">{error}</p>}
          <footer>
            <button className="primary-button" disabled={loading} type="submit">
              {loading
                ? mode === "login"
                  ? "Ingresando..."
                  : "Creando cuenta..."
                : mode === "login"
                  ? "Entrar"
                  : "Crear cuenta"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
