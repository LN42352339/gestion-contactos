// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  obtenerContactos,
  agregarContacto,
  actualizarContacto,
  eliminarContacto,
} from "../services/contactService";
import ExportModal from "../components/ExportModal.tsx";
import ContactModalForm from "../components/ContactModalForm";
import { agregarAHistorial } from "../services/historialService";
import QuickActions from "../components/QuickActions.tsx";
import { useNavigate } from "react-router-dom";
import ContactTable from "../components/ContactTable";
import { Contacto } from "../types";
import "../index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import {
  exportarContactosVCF,
  exportarContactosCSV,
  exportarContactosExcel,
} from "../utils/exportUtils";
import { validarContacto } from "../utils/formUtils";
import { obtenerContactosPaginados } from "../utils/paginationUtils";

export default function Dashboard() {
  const [cargando, setCargando] = useState(true);
  const [mostrarModalExportar, setMostrarModalExportar] = useState(false);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState(1);
  const contactosPorPagina = 10;
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);
  const [contactosSeleccionados, setContactosSeleccionados] = useState<
    string[]
  >([]);
  const [nuevoContacto, setNuevoContacto] = useState<Contacto>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    dni: "",
    telefono: "",
    email: "",
    cargo: "",
    area: "",
    supervisor: "",
  });

  const accesosRapidos = [
    {
      label: "Agregar",
      img: "https://img.icons8.com/ios-filled/50/add-user-group-man-man.png",
      onClick: () => {
        setMostrarFormulario(true);
        setModoEdicion(false);
        setNuevoContacto({
          primerNombre: "",
          segundoNombre: "",
          primerApellido: "",
          segundoApellido: "",
          dni: "",
          telefono: "",
          email: "",
          cargo: "",
          area: "",
          supervisor: "",
        });
      },
    },
    {
      label: "Importar",
      img: "https://img.icons8.com/ios-filled/50/import-csv.png",
      onClick: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx,.xls,.csv";
        input.onchange = manejarArchivo;
        input.click();
      },
    },
    {
      label: "Exportar",
      img: "https://img.icons8.com/ios-filled/50/vcf.png",
      onClick: () => setMostrarModalExportar(true),
    },
    {
      label: "Dashboard",
      img: "https://img.icons8.com/ios-filled/50/combo-chart.png",
      onClick: () => navigate("/estadisticas"),
    },
    {
      label: "Historial de Contacto",
      img: "https://img.icons8.com/ios-filled/50/search-contacts.png",
      onClick: () => navigate("/historial"),
    },
    {
      label: "Perfil",
      img: "https://img.icons8.com/ios-filled/50/user.png",
    },
  ];

  useEffect(() => {
    const cargarContactos = async () => {
      try {
        const contactosLista = await obtenerContactos();
        setContactos(contactosLista);
      } catch (error) {
        console.error("Error al cargar contactos:", error);
        toast.error("Error al cargar contactos.");
      } finally {
        setTimeout(() => setCargando(false), 500);
      }
    };
    cargarContactos();
  }, []);

  const manejarArchivo = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const datos: Contacto[] = XLSX.utils.sheet_to_json(hoja);

      const nuevos: Contacto[] = [];
      for (const contacto of datos) {
        if (
          contacto.primerNombre &&
          contacto.primerApellido &&
          contacto.segundoApellido &&
          contacto.dni &&
          contacto.telefono &&
          contacto.area
        ) {
          const telExiste = contactos.some(
            (c) => c.telefono === String(contacto.telefono)
          );
          if (!telExiste) {
            const contactoSanitizado: Contacto = {
              primerNombre: String(contacto.primerNombre).toUpperCase(),
              segundoNombre: String(contacto.segundoNombre || "").toUpperCase(),
              primerApellido: String(contacto.primerApellido).toUpperCase(),
              segundoApellido: String(
                contacto.segundoApellido || ""
              ).toUpperCase(),
              dni: String(contacto.dni),
              telefono: String(contacto.telefono),
              email: String(contacto.email || ""),
              cargo: String(contacto.cargo || "").toUpperCase(),
              area: String(contacto.area).toUpperCase(),
              supervisor: String(contacto.supervisor || "").toUpperCase(),
            };
            const id = await agregarContacto(contactoSanitizado);
            nuevos.push({ ...contactoSanitizado, id });
          }
        }
      }
      setContactos([...contactos, ...nuevos]);
      toast.success("✅ Contactos importados correctamente");
    };
    reader.readAsBinaryString(archivo);
  };

  //

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPaginaActual(1);
  };

  const toggleSeleccion = (id: string) => {
    setContactosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    const idsPagina = contactosPaginados
      .map((c) => c.id)
      .filter(Boolean) as string[];
    const todosSeleccionados = idsPagina.every((id) =>
      contactosSeleccionados.includes(id)
    );
    setContactosSeleccionados(
      todosSeleccionados
        ? contactosSeleccionados.filter((id) => !idsPagina.includes(id))
        : [...new Set([...contactosSeleccionados, ...idsPagina])]
    );
  };

  const eliminarSeleccionados = async () => {
    if (contactosSeleccionados.length === 0) {
      toast.warn("No has seleccionado ningún contacto.");
      return;
    }

    const confirmar = window.confirm(
      "¿Deseas eliminar los contactos seleccionados?"
    );
    if (!confirmar) return;

    const eliminados: Contacto[] = [];

    for (const id of contactosSeleccionados) {
      const contacto = contactos.find((c) => c.id === id);
      if (contacto) eliminados.push(contacto);
      await eliminarContacto(id);
    }

    setContactos(
      contactos.filter((c) => !contactosSeleccionados.includes(c.id!))
    );
    setContactosSeleccionados([]);
    toast.success("Contactos eliminados correctamente.");
  };

  const { contactosPaginados, contactosFiltrados } = obtenerContactosPaginados(
    contactos,
    searchQuery,
    paginaActual,
    contactosPorPagina
  );

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
    setMostrarFormulario(true);
  };

  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;

    const contacto = contactos.find((c) => c.id === id);
    if (!contacto) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este contacto?"
    );
    if (!confirmar) {
      toast.info("Eliminación cancelada.");
      return;
    }

    try {
      await agregarAHistorial(contacto);
      await eliminarContacto(id);

      setContactos(contactos.filter((c) => c.id !== id));
      toast.success("Contacto eliminado y guardado en el historial.");
    } catch (error) {
      console.error("Error al eliminar el contacto con historial:", error);
      toast.error("Error al eliminar el contacto.");
    }
  };

  const manejarSubmit = async () => {
    const error = validarContacto(
      nuevoContacto,
      contactos,
      modoEdicion,
      idEdicion
    );
    if (error) {
      toast.error(error);
      return;
    }

    const contactoMayusculas: Contacto = Object.fromEntries(
      Object.entries(nuevoContacto).map(([k, v]) => [
        k,
        typeof v === "string" && k !== "email" ? v.toUpperCase() : v,
      ])
    ) as Contacto;

    try {
      if (modoEdicion && idEdicion) {
        await actualizarContacto(idEdicion, contactoMayusculas);
        setContactos(
          contactos.map((c) =>
            c.id === idEdicion ? { ...contactoMayusculas, id: idEdicion } : c
          )
        );
        toast.success("✅ Contacto actualizado exitosamente.");
      } else {
        const id = await agregarContacto(contactoMayusculas);
        setContactos([...contactos, { ...contactoMayusculas, id }]);
        toast.success("✅ Contacto agregado exitosamente.");
      }

      setMostrarFormulario(false);
      setModoEdicion(false);
      setIdEdicion(null);
    } catch (error) {
      console.error("Error al guardar el contacto:", error);
      toast.error("Ocurrió un error al guardar el contacto.");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <img
          src="/src/assets/img/cargando.webp"
          alt="Logo"
          className="w-24 h-24 animate-pulse mb-4"
        />
        <span className="text-gray-600 text-lg animate-pulse font-semibold">
          Cargando contactos...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="w-full p-6">
        <ToastContainer position="top-center" autoClose={3000} />
        <h2 className="text-3xl font-bold text-center text-slate-600 mb-6">
          Gestión de Contactos
        </h2>

        <QuickActions actions={accesosRapidos} />

        {mostrarFormulario && (
          <ContactModalForm
            contacto={nuevoContacto}
            modoEdicion={modoEdicion}
            manejarCambio={(e) => {
              const { name, value } = e.target;
              const valor = name === "email" ? value : value.toUpperCase();
              setNuevoContacto((prev) => ({ ...prev, [name]: valor }));
            }}
            manejarSubmit={manejarSubmit}
            onClose={() => setMostrarFormulario(false)}
          />
        )}

        {mostrarModalExportar && (
          <ExportModal
            onClose={() => setMostrarModalExportar(false)}
            onExportVCF={() =>
              exportarContactosVCF(
                contactosSeleccionados.length > 0
                  ? contactos.filter((c) =>
                      contactosSeleccionados.includes(c.id || "")
                    )
                  : contactos
              )
            }
            onExportCSV={() =>
              exportarContactosCSV(
                contactosSeleccionados.length > 0
                  ? contactos.filter((c) =>
                      contactosSeleccionados.includes(c.id || "")
                    )
                  : contactos
              )
            }
            onExportExcel={() =>
              exportarContactosExcel(
                contactosSeleccionados.length > 0
                  ? contactos.filter((c) =>
                      contactosSeleccionados.includes(c.id || "")
                    )
                  : contactos
              )
            }
          />
        )}

        <div className="w-full mt-4">
          <input
            type="text"
            placeholder="Buscar por nombres o apellidos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border border-slate-700 p-2 w-full rounded-md"
          />
        </div>

        <div className="w-full mt-4 text-right text-sm text-gray-600">
          Total de contactos: {contactosFiltrados.length}
        </div>

        <div className="w-full mt-8">
          <button
            onClick={eliminarSeleccionados}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar Seleccionados
          </button>

          <ContactTable
            contactos={contactosPaginados}
            editarContacto={manejarEditar}
            eliminarContacto={manejarEliminar}
            contactosSeleccionados={contactosSeleccionados}
            toggleSeleccion={toggleSeleccion}
            toggleSeleccionTodos={toggleSeleccionTodos}
          />
        </div>
      </main>
    </div>
  );
}

//ULTIMO
