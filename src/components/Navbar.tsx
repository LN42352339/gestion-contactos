// src/components/Navbar.tsx
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { useAuth } from "../contexts/AuthContext"; // Hook que retorna { user, loading }
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logod.png";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="bg-red-500 text-white px-4 py-2 flex justify-between items-center">
      {/* Sección izquierda: Logo y nombre de la aplicación */}
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-15 w-20 object-contain" />
        <span className="text-xl font-bold">Congreso de la República</span>
      </div>

      {/* Sección derecha: Saludo al usuario y botón de logout */}
      <div className="flex items-center space-x-4">
        {user && (
          <span className="font-semibold">
            Hola, {user.displayName || user.email}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="!bg-white !text-red-600 !border-2 !border-red-600 
             !px-4 !py-2 !rounded-md !transition-all !duration-300 
             hover:!bg-black hover:!text-white hover:!shadow-lg hover:!scale-105"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
