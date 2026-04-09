import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

type Receipt = {
  id: number;
  receiptNumber: string;
  createdAt: string;
  totalAmount: number;
  items: { productId: number; productName: string; quantity: number; unitPrice: number; lineTotal: number }[];
};

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const printableDate = useMemo(
    () => (data ? new Date(data.createdAt).toLocaleString() : ""),
    [data],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Receipt>(`/receipts/${id}`);
        setData(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "No se pudo cargar el recibo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Detalle de recibo</h2>
          {data ? (
            <p className="mt-1 text-sm text-slate-300">
              {data.receiptNumber} · {printableDate}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-300">Recibo #{id}</p>
          )}
        </div>
        <button
          className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
          onClick={() => window.print()}
        >
          Imprimir
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-300">
          Cargando...
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Recibo</div>
              <div className="mt-1 text-sm font-semibold">{data.receiptNumber}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Fecha</div>
              <div className="mt-1 text-sm font-semibold">{printableDate}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Total</div>
              <div className="mt-1 text-sm font-semibold">${Number(data.totalAmount).toFixed(2)}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2 text-right">Cant.</th>
                  <th className="px-3 py-2 text-right">Unitario</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/20">
                {data.items.map((it) => (
                  <tr key={`${it.productId}-${it.productName}`}>
                    <td className="px-3 py-3 font-semibold">{it.productName}</td>
                    <td className="px-3 py-3 text-right">{it.quantity}</td>
                    <td className="px-3 py-3 text-right">${Number(it.unitPrice).toFixed(2)}</td>
                    <td className="px-3 py-3 text-right">${Number(it.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

