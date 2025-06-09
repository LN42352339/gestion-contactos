import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import History from "./pages/History";
import Statistics from "./pages/Statistics";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // 👈 Importa Layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas protegidas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/historial" element={<History />} />
          <Route path="/estadisticas" element={<Statistics />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
