import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/img/cargando.webp";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const obtenerNombre = async () => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setNombreUsuario(docSnap.data().nombre);
          } else {
            setNombreUsuario(user.email || "Usuario");
          }
        } catch (error) {
          console.error("Error al obtener el nombre:", error);
          setNombreUsuario(user.email || "Usuario");
        }
      }
    };

    obtenerNombre();
  }, [user]);

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
      {/* Logo y título que redirige al dashboard */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <img src={logo} alt="Logo" className="h-15 w-20 object-contain" />
        <span className="text-xl font-bold">Congreso de la República</span>
      </div>

      {/* Usuario y botón de logout */}
      <div className="flex items-center space-x-4">
        {user && (
          <span className="font-semibold">Hola, {nombreUsuario}</span>
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
