import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { api } from "../lib/api";

type Category = { id: number; name: string; createdAt: string };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [name, setName] = useState("");

  const title = useMemo(() => (edit ? "Editar categoría" : "Nueva categoría"), [edit]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Category[]>("/categories");
      setItems(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Categorías</h2>
          <p className="mt-1 text-sm text-slate-300">Crea, edita o elimina categorías.</p>
        </div>
        <button
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          onClick={() => {
            setEdit(null);
            setName("");
            setModalOpen(true);
          }}
        >
          Nueva
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
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/20">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={2}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-300" colSpan={2}>
                  No hay categorías.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-3">{c.name}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
                        onClick={() => {
                          setEdit(c);
                          setName(c.name);
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                        onClick={async () => {
                          if (!confirm(`¿Borrar la categoría "${c.name}"?`)) return;
                          setError(null);
                          try {
                            await api.delete(`/categories/${c.id}`);
                            await reload();
                          } catch (err: any) {
                            setError(err?.response?.data?.message ?? "No se pudo borrar.");
                          }
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={title}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              if (edit) {
                await api.put(`/categories/${edit.id}`, { name });
              } else {
                await api.post("/categories", { name });
              }
              setModalOpen(false);
              await reload();
            } catch (err: any) {
              setError(err?.response?.data?.message ?? "No se pudo guardar.");
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm text-slate-300">Nombre</span>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

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

