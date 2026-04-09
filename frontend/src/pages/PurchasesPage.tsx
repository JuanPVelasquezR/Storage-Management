import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  categoryName: string;
};
type PagedResult<T> = { items: T[]; page: number; pageSize: number; total: number };
type CartItem = { product: Product; quantity: number };
type Receipt = {
  id: number;
  receiptNumber: string;
  createdAt: string;
  totalAmount: number;
  items: { productId: number; productName: string; quantity: number; unitPrice: number; lineTotal: number }[];
};

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);

  const total = useMemo(
    () => cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0),
    [cart],
  );

  async function searchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PagedResult<any>>("/products", {
        params: { search: search.trim(), active: true, page: 1, pageSize: 10 },
      });
      setResults(
        res.data.items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          active: p.active,
          categoryName: p.categoryName,
        })),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo buscar productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addToCart(p: Product) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        const nextQty = Math.min(p.stock, next[idx].quantity + 1);
        next[idx] = { ...next[idx], quantity: nextQty };
        return next;
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Compras</h2>
        <p className="mt-1 text-sm text-slate-300">
          Arma un carrito y confirma para generar un recibo.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-4">
          <div className="flex items-center gap-2">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchProducts();
              }}
            />
            <button
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
              disabled={loading}
              onClick={searchProducts}
            >
              {loading ? "..." : "Buscar"}
            </button>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2 text-right">Precio</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">Añadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/20">
                {results.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-300" colSpan={4}>
                      No hay resultados.
                    </td>
                  </tr>
                ) : (
                  results.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-3">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.categoryName}</div>
                      </td>
                      <td className="px-3 py-3 text-right">${p.price.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right">{p.stock}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                          disabled={p.stock <= 0}
                          onClick={() => addToCart(p)}
                        >
                          + Carrito
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Carrito</div>
            <div className="text-sm text-slate-300">
              Total: <span className="font-semibold text-slate-100">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-300">
                Aún no agregaste productos.
              </div>
            ) : (
              cart.map((it) => (
                <div
                  key={it.product.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/30 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold">{it.product.name}</div>
                    <div className="text-xs text-slate-400">
                      ${it.product.price.toFixed(2)} · stock {it.product.stock}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg bg-slate-800 px-2 py-1 text-sm font-semibold hover:bg-slate-700"
                      onClick={() =>
                        setCart((prev) =>
                          prev
                            .map((x) =>
                              x.product.id === it.product.id
                                ? { ...x, quantity: Math.max(1, x.quantity - 1) }
                                : x,
                            )
                            .filter((x) => x.quantity > 0),
                        )
                      }
                    >
                      −
                    </button>
                    <input
                      className="w-16 rounded-lg border border-slate-700 bg-slate-950/40 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                      type="number"
                      min={1}
                      max={it.product.stock}
                      value={it.quantity}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(it.product.stock, Number(e.target.value)));
                        setCart((prev) =>
                          prev.map((x) =>
                            x.product.id === it.product.id ? { ...x, quantity: v } : x,
                          ),
                        );
                      }}
                    />
                    <button
                      className="rounded-lg bg-slate-800 px-2 py-1 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
                      disabled={it.quantity >= it.product.stock}
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((x) =>
                            x.product.id === it.product.id
                              ? { ...x, quantity: Math.min(it.product.stock, x.quantity + 1) }
                              : x,
                          ),
                        )
                      }
                    >
                      +
                    </button>
                    <button
                      className="rounded-lg bg-rose-600/90 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                      onClick={() =>
                        setCart((prev) => prev.filter((x) => x.product.id !== it.product.id))
                      }
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={() => setCart([])}
            >
              Vaciar
            </button>
            <button
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={async () => {
                setError(null);
                try {
                  const payload = {
                    items: cart.map((x) => ({ productId: x.product.id, quantity: x.quantity })),
                  };
                  const res = await api.post<Receipt>("/receipts", payload);
                  setCart([]);
                  navigate(`/recibos/${res.data.id}`);
                } catch (err: any) {
                  setError(err?.response?.data?.message ?? "No se pudo confirmar la compra.");
                }
              }}
            >
              Confirmar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

