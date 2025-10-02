"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [seedError, setSeedError] = useState("");
  const [demoCredentials, setDemoCredentials] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let activo = true;

    const prepararUsuarioDemo = async () => {
      try {
        const response = await fetch("/api/test-user", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Respuesta inválida");
        }

        const data = await response.json();
        if (activo) {
          setDemoCredentials(data.credenciales ?? null);
          setSeedError("");
        }
      } catch (seedErr) {
        console.error("No se pudo preparar el usuario de prueba:", seedErr);
        if (activo) {
          setSeedError(
            "No se pudo preparar el usuario de demostración automáticamente."
          );
          setDemoCredentials(null);
        }
      }
    };

    prepararUsuarioDemo();

    return () => {
      activo = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");
    setError("");

    if (!nombreUsuario || !password) {
      setError("Ingresa usuario y contraseña.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ nombre_usuario: nombreUsuario, password }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          const sessionResponse = await fetch("/api/login", {
            credentials: "include",
          });
          const sessionData = await sessionResponse.json();

          if (sessionResponse.ok) {
            setMensaje(
              sessionData.message ??
                data.message ??
                "Inicio de sesión exitoso y sesión validada."
            );
            setError("");
          } else {
            setMensaje(data.message ?? "Inicio de sesión exitoso.");
            setError(
              sessionData.message ??
                "No se pudo validar la sesión del usuario."
            );
          }
        } catch (sessionError) {
          console.error("No se pudo validar la sesión:", sessionError);
          setMensaje(data.message ?? "Inicio de sesión exitoso.");
          setError("No se pudo validar la sesión del usuario.");
        }
      } else {
        setMensaje("");
        setError(data.message ?? "No se pudo iniciar sesión.");
      }
    } catch (fetchError) {
      console.error("Error al iniciar sesión:", fetchError);
      setMensaje("");
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-slate-900 text-center mb-6">
          Iniciar sesión
        </h1>
        <div className="mb-6 space-y-2 text-sm text-slate-600">
          <p className="font-medium text-slate-700">
            Usa estas credenciales de prueba:
          </p>
          {demoCredentials ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
              <p>
                Usuario: <span className="font-semibold">{demoCredentials.usuario}</span>
              </p>
              <p>
                Contraseña: <span className="font-semibold">{demoCredentials.password}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Preparando usuario de demostración...
            </p>
          )}
          {seedError && (
            <p className="text-xs text-red-600">{seedError}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nombre_usuario"
              className="block text-sm font-medium text-slate-700"
            >
              Usuario
            </label>
            <input
              id="nombre_usuario"
              name="nombre_usuario"
              type="text"
              value={nombreUsuario}
              onChange={(event) => setNombreUsuario(event.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          {mensaje && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
              {mensaje}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
