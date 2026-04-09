import { useEffect } from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
          </div>
          <button
            className="rounded-lg px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

