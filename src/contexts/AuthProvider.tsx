// src/contexts/AuthProvider.tsx

import React, { createContext, useEffect, useState } from "react"; // Importamos React y los hooks necesarios
import { User, onAuthStateChanged } from "firebase/auth"; // Importamos el tipo User y la función para detectar cambios de autenticación
import { auth } from "../config/firebaseConfig"; // Importamos la configuración de Firebase

// Definimos la forma que tendrá nuestro contexto
interface AuthContextProps {
  user: User | null; // El usuario autenticado (o null si no hay sesión)
  loading: boolean; // Estado para saber si aún se está verificando la sesión
}

// Creamos el contexto con valores por defecto
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

// Componente proveedor del contexto, que envolverá toda la aplicación
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null); // Estado para guardar el usuario
  const [loading, setLoading] = useState(true); // Estado para controlar la carga inicial

  // Al montar el componente, escuchamos los cambios en la autenticación con Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Guardamos el usuario actual
      setLoading(false); // Ya se ha verificado el estado de la sesión
    });

    return () => unsubscribe(); // Limpieza: cancelamos la suscripción al desmontar
  }, []);

  // Retornamos el proveedor del contexto, pasando el usuario y el estado de carga
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children} {/* Los componentes hijos tendrán acceso al contexto */}
    </AuthContext.Provider>
  );
}
