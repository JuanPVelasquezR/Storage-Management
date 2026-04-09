import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import PurchasesPage from "./pages/PurchasesPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ReceiptDetailPage from "./pages/ReceiptDetailPage";
import AppShell from "./components/AppShell";
import { isAuthed } from "./lib/auth";

function Private({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <Private>
            <AppShell />
          </Private>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="compras" element={<PurchasesPage />} />
        <Route path="recibos" element={<ReceiptsPage />} />
        <Route path="recibos/:id" element={<ReceiptDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

