import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AuthPage } from "./components/AuthPage";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import History from "./pages/History";

function AppContent() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div>Memuat sesi...</div>;
  if (!user) return <AuthPage />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}