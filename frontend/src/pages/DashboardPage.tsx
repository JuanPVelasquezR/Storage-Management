export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-300">
          Resumen general.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Productos", value: "—" },
          { label: "Categorías", value: "—" },
          { label: "Ventas hoy", value: "—" },
          { label: "Ventas mes", value: "—" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"
          >
            <div className="text-xs text-slate-400">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

