import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatisticsDashboard from "../components/StatisticsDashboard";
import { obtenerContactos } from "../services/contactService";
import { Contacto } from "../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function EstadisticasPage() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [eliminados, setEliminados] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const lista = await obtenerContactos();
        setContactos(lista);

        const historialSnap = await getDocs(
          collection(db, "historialContactos")
        );
        setEliminados(historialSnap.size);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const contarContactosPorArea = () => {
    const conteo: { area: string; cantidad: number }[] = [];
    const agrupado: { [area: string]: number } = {};

    contactos.forEach((contacto) => {
      if (contacto.area) {
        agrupado[contacto.area] = (agrupado[contacto.area] || 0) + 1;
      }
    });

    for (const area in agrupado) {
      conteo.push({ area, cantidad: agrupado[area] });
    }

    return conteo;
  };

  const datosArea = contarContactosPorArea();

  const areaConMasContactos = datosArea.reduce(
    (prev, curr) => (curr.cantidad > prev.cantidad ? curr : prev),
    { area: "Sin datos", cantidad: 0 }
  ).area;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">
          Cargando estadísticas...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-700">
          Estadísticas de Contactos
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Volver
        </button>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-xl p-6 overflow-auto">
        <StatisticsDashboard
          datosGrafico={datosArea}
          colores={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c"]}
          cantidadContactos={contactos.length}
          cantidadEliminados={eliminados} // ✅ Comentario correcto aquí fuera del prop
          areaConMasContactos={areaConMasContactos}
          onCerrar={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
}
