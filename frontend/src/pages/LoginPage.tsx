import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-soft backdrop-blur">
          <h1 className="text-xl font-semibold">Acceso administrador</h1>
          <p className="mt-1 text-sm text-slate-300">
            Inicia sesión para gestionar productos, categorías y ventas.
          </p>

          <form
            className="mt-6 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await api.post("/auth/login", { username, password });
                setToken(res.data.token);
                navigate("/", { replace: true });
              } catch (err: any) {
                setError(err?.response?.data?.message ?? "No se pudo iniciar sesión.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="grid gap-1">
              <span className="text-sm text-slate-300">Usuario</span>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-300">Contraseña</span>
              <input
                type="password"
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              className="mt-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-xs text-slate-400">
            Por defecto usa <span className="font-mono">admin/admin</span> (configurable por variables de entorno).
          </div>
        </div>
      </div>
    </div>
  );
}

