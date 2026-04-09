import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { api } from "../lib/api";

type Category = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  active: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};
type PagedResult<T> = { items: T[]; page: number; pageSize: number; total: number };

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [active, setActive] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    categoryId: 0,
    active: true,
  });

  const modalTitle = useMemo(() => (edit ? "Editar producto" : "Nuevo producto"), [edit]);

  async function loadCategories() {
    const res = await api.get<Category[]>("/categories");
    setCategories(res.data.map((c) => ({ id: c.id, name: c.name })));
  }

  async function loadProducts(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: nextPage, pageSize };
      if (search.trim()) params.search = search.trim();
      if (categoryId !== "") params.categoryId = categoryId;
      if (active !== "") params.active = active === "true";
      const res = await api.get<PagedResult<Product>>("/products", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadCategories();
      } catch (e) {
        // ignore; se mostrará error al cargar productos si aplica
      } finally {
        await loadProducts(1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="mt-1 text-sm text-slate-300">Gestiona el catálogo.</p>
        </div>
        <button
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          onClick={() => {
            setEdit(null);
            setForm({
              name: "",
              description: "",
              price: 0,
              stock: 0,
              imageUrl: "",
              categoryId: categories[0]?.id ?? 0,
              active: true,
            });
            setModalOpen(true);
          }}
        >
          Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          value={active}
          onChange={(e) => setActive(e.target.value as any)}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
          onClick={async () => {
            setPage(1);
            await loadProducts(1);
          }}
        >
          Aplicar filtros
        </button>
        <button
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
          onClick={async () => {
            setSearch("");
            setCategoryId("");
            setActive("");
            setPage(1);
            await loadProducts(1);
          }}
        >
          Limpiar
        </button>
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
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Stock</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/20">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={6}>
                  Cargando...
                </td>
              </tr>
            ) : (data?.items.length ?? 0) === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={6}>
                  No hay productos.
                </td>
              </tr>
            ) : (
              data!.items.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-3">
                    <div className="font-semibold">{p.name}</div>
                    {p.description ? (
                      <div className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                        {p.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">{p.categoryName}</td>
                  <td className="px-3 py-3 text-right">${p.price.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right">{p.stock}</td>
                  <td className="px-3 py-3">
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-xs font-semibold",
                        p.active ? "bg-emerald-900/40 text-emerald-200" : "bg-slate-800 text-slate-300",
                      ].join(" ")}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
                        onClick={() => {
                          setEdit(p);
                          setForm({
                            name: p.name,
                            description: p.description ?? "",
                            price: p.price,
                            stock: p.stock,
                            imageUrl: p.imageUrl ?? "",
                            categoryId: p.categoryId,
                            active: p.active,
                          });
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className={[
                          "rounded-lg px-3 py-1.5 text-xs font-semibold text-white",
                          p.active
                            ? "bg-rose-600/90 hover:bg-rose-600"
                            : "bg-emerald-600/90 hover:bg-emerald-600",
                        ].join(" ")}
                        onClick={async () => {
                          const nextActive = !p.active;
                          const actionText = nextActive ? "Activar" : "Desactivar";
                          if (!confirm(`¿${actionText} "${p.name}"?`)) return;
                          setError(null);
                          try {
                            await api.patch(`/products/${p.id}/active`, { active: nextActive });
                            await loadProducts(page);
                          } catch (err: any) {
                            setError(
                              err?.response?.data?.message ??
                                (nextActive ? "No se pudo activar." : "No se pudo desactivar.")
                            );
                          }
                        }}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
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
              await loadProducts(next);
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
              await loadProducts(next);
            }}
          >
            Siguiente
          </button>
        </div>
      </div>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              if (!form.categoryId) throw new Error("Selecciona una categoría.");
              if (edit) {
                await api.put(`/products/${edit.id}`, form);
              } else {
                await api.post("/products", form);
              }
              setModalOpen(false);
              await loadProducts(page);
            } catch (err: any) {
              setError(err?.response?.data?.message ?? err?.message ?? "No se pudo guardar.");
            }
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-slate-300">Nombre</span>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-slate-300">Descripción</span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-300">Precio</span>
              <input
                type="number"
                step="0.01"
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-300">Stock</span>
              <input
                type="number"
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-slate-300">URL imagen (opcional)</span>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-300">Categoría</span>
              <select
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Activo
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
            <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

