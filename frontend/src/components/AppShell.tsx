import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../lib/auth";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/compras", label: "Compras" },
  { to: "/recibos", label: "Recibos" },
];

export default function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 shadow-soft backdrop-blur">
          <Link to="/" className="text-sm font-semibold tracking-wide text-slate-100">
            Gestión de Productos
          </Link>
          <button
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
            onClick={() => {
              clearToken();
              navigate("/login");
            }}
          >
            Salir
          </button>
        </header>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/30 p-2">
            <nav className="grid gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      isActive ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-slate-800",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

