import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type ReceiptListItem = { id: number; receiptNumber: string; createdAt: string; totalAmount: number };
type PagedResult<T> = { items: T[]; page: number; pageSize: number; total: number };

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReceiptsPage() {
  const [from, setFrom] = useState(() => toDateInputValue(new Date(Date.now() - 7 * 86400000)));
  const [to, setTo] = useState(() => toDateInputValue(new Date()));
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [data, setData] = useState<PagedResult<ReceiptListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1),
    [data],
  );

  async function load(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: nextPage, pageSize };
      if (from) params.from = new Date(`${from}T00:00:00.000Z`).toISOString();
      if (to) params.to = new Date(`${to}T23:59:59.999Z`).toISOString();
      const res = await api.get<PagedResult<ReceiptListItem>>("/receipts", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudieron cargar los recibos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Recibos</h2>
        <p className="mt-1 text-sm text-slate-300">Consulta de ventas.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs text-slate-400">Desde</span>
          <input
            type="date"
            className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-slate-400">Hasta</span>
          <input
            type="date"
            className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
            onClick={async () => {
              setPage(1);
              await load(1);
            }}
          >
            Aplicar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Recibo</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/20">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={4}>
                  Cargando...
                </td>
              </tr>
            ) : (data?.items.length ?? 0) === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={4}>
                  No hay recibos en ese rango.
                </td>
              </tr>
            ) : (
              data!.items.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3 font-semibold">{r.receiptNumber}</td>
                  <td className="px-3 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">${Number(r.totalAmount).toFixed(2)}</td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                      to={`/recibos/${r.id}`}
                    >
                      Detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-300">
        <div>
          Página {page} de {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={async () => {
              const next = Math.max(1, page - 1);
              setPage(next);
              await load(next);
            }}
          >
            Anterior
          </button>
          <button
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
            disabled={page >= totalPages || loading}
            onClick={async () => {
              const next = Math.min(totalPages, page + 1);
              setPage(next);
              await load(next);
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

