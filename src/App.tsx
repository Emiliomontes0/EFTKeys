import { Navigate, Route, Routes } from "react-router-dom";
import { KeyDetailPage } from "./pages/KeyDetailPage";
import { KeySearchPage } from "./pages/KeySearchPage";
import { MapKeysPage } from "./pages/MapKeysPage";
import "./App.css";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<KeySearchPage />} />
        <Route path="/map/:normalizedName" element={<MapKeysPage />} />
        <Route path="/key/:id" element={<KeyDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
