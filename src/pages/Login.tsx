// src/pages/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import bgCongreso from "../assets/img/bg-congreso.jpg";
import logo from "../assets/img/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg("Error al iniciar sesión. Revisa tus credenciales.");
      console.error("Error en login:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sección Izquierda: Imagen de fondo */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgCongreso})`, // Usar la imagen importada
        }}
      >
        <div className="w-full h-full flex items-center justify-center"
           style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="text-white text-center p-8">
            <h1 className="text-5xl  mb-6">
              Sistema de Administración de Contactos - Empresas
            </h1>
            <p className="text-lg">
              Congreso de la República del Perú
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm m-4">
          {/* (Opcional) Logo en la parte superior */}
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo} alt="Logo" className="h-30 w-auto"
            />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
          {errorMsg && <p className="text-red-500 mb-2 text-center">{errorMsg}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-1 font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block mb-1 font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
            >
              Ingresar
            </button>
          </form>

          {/* Enlaces de ayuda */}
          <div className="mt-4 text-center">
            <a href="#" className="text-blue-600 hover:text-blue-800 transition">
              ¿Olvidaste tu contraseña?
            </a>
            <br />
            <a href="#" className="text-blue-600 hover:text-blue-800 transition">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
