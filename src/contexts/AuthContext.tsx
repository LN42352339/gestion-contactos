// src/contexts/AuthContext.tsx

// 🧠 Importamos React y los hooks necesarios para crear y usar el contexto
import React, { createContext, useContext, useEffect, useState } from "react";

// 🔐 Importamos el tipo User y la función que detecta cambios de sesión de Firebase
import { User, onAuthStateChanged } from "firebase/auth";

// 🔥 Importamos la instancia de autenticación desde nuestra configuración de Firebase
import { auth } from "../config/firebaseConfig";

// 📦 Definimos la forma del contexto con TypeScript
interface AuthContextProps {
  user: User | null;       // El usuario autenticado, o null si no hay sesión
  loading: boolean;        // Si aún se está verificando la sesión
}

// 🏗️ Creamos el contexto con valores por defecto
const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

// 🌐 Componente proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 🧠 Estados para guardar el usuario y el estado de carga
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Efecto que se ejecuta al iniciar la app para verificar si hay una sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);     // Guardamos el usuario si está logueado
      setLoading(false);        // Ya terminó la verificación
    });

    // 🧼 Cancelamos el listener si se desmonta el componente
    return () => unsubscribe();
  }, []);

  // 📤 Devolvemos el proveedor con los valores disponibles en toda la app
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🧩 Custom Hook para acceder fácilmente al contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
