// src/pages/Dashboard.tsx
import { useEffect, useState, useRef } from "react";
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
import DeletingOverlay from "../components/DeletingOverlay";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import {
  exportarContactosVCF,
  exportarContactosCSV,
  exportarContactosExcel,
} from "../utils/exportUtils";
import { validarContacto } from "../utils/formUtils";
import { FaTrash } from "react-icons/fa";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { eliminarContactosBatchConProgreso } from "../services/contactService";

function convertirFechaExcel(fechaSerial: number): string {
  const fecha = new Date(Math.round((fechaSerial - 25569) * 86400 * 1000));
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export default function Dashboard() {
  const [cargando, setCargando] = useState(true);
  const [mostrarModalExportar, setMostrarModalExportar] = useState(false);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // NUEVO: estado para modal de confirmación reutilizable
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string>("¿Eliminar?");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const confirmActionRef = useRef<() => void | Promise<void>>(() => {});

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);

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
    area: "",
    fechaAtencion: "",
    operador: "",
    telefono: "",
    marca: "",
    modelo: "",
    serie: "",
    nombreCompleto: "",
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
          area: "",
          fechaAtencion: "",
          operador: "",
          telefono: "",
          marca: "",
          modelo: "",
          serie: "",
          nombreCompleto: "",
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
    { label: "Perfil", img: "https://img.icons8.com/ios-filled/50/user.png" },
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

      // Ya no necesitas mapear manualmente, los nombres están bien
      const datos: Contacto[] = XLSX.utils.sheet_to_json(hoja);

      const nuevos: Contacto[] = [];

      for (const contacto of datos) {
        if (
          contacto.primerNombre &&
          contacto.primerApellido &&
          contacto.area &&
          contacto.fechaAtencion &&
          contacto.operador &&
          contacto.telefono &&
          contacto.marca &&
          contacto.modelo &&
          contacto.serie
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
              area: String(contacto.area).toUpperCase(),
              fechaAtencion: (() => {
                if (typeof contacto.fechaAtencion === "number") {
                  return convertirFechaExcel(contacto.fechaAtencion);
                }
                if (
                  typeof contacto.fechaAtencion === "string" &&
                  /^\d{2}\/\d{2}\/\d{4}$/.test(contacto.fechaAtencion)
                ) {
                  return contacto.fechaAtencion;
                }
                if (!isNaN(Date.parse(contacto.fechaAtencion))) {
                  const fecha = new Date(contacto.fechaAtencion);
                  const dia = String(fecha.getDate()).padStart(2, "0");
                  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                  const anio = fecha.getFullYear();
                  return `${dia}/${mes}/${anio}`;
                }
                return "01/01/1900"; // Fecha por defecto si no se puede procesar
              })(),

              operador: String(contacto.operador).toUpperCase(),
              telefono: String(contacto.telefono),
              marca: String(contacto.marca).toUpperCase(),
              modelo: String(contacto.modelo).toUpperCase(),
              serie: String(contacto.serie).toUpperCase(),
              nombreCompleto: `${contacto.primerNombre} ${
                contacto.segundoNombre || ""
              } ${contacto.primerApellido} ${contacto.segundoApellido || ""}`
                .trim()
                .toUpperCase(),
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const toggleSeleccion = (id: string) => {
    setContactosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    const idsTodos = contactosFiltrados
      .map((c) => c.id)
      .filter(Boolean) as string[];
    const todosSeleccionados = idsTodos.every((id) =>
      contactosSeleccionados.includes(id)
    );
    setContactosSeleccionados(
      todosSeleccionados
        ? contactosSeleccionados.filter((id) => !idsTodos.includes(id))
        : [...new Set([...contactosSeleccionados, ...idsTodos])]
    );
  };

  const contactosFiltrados = contactos.filter((c) =>
    `${c.primerNombre} ${c.segundoNombre} ${c.primerApellido} ${c.segundoApellido}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
    setMostrarFormulario(true);
  };

  // ABRE el modal para confirmar eliminación múltiple
  const solicitarEliminarSeleccionados = () => {
    if (contactosSeleccionados.length === 0) {
      toast.warn("No has seleccionado ningún contacto.");
      return;
    }
    setConfirmTitle("¿Eliminar contactos seleccionados?");
    setConfirmMessage(
      `Se eliminarán ${contactosSeleccionados.length} contacto(s). Esta acción no se puede deshacer.`
    );
    confirmActionRef.current = eliminarSeleccionadosConfirmado;
    setConfirmOpen(true);
  };

  // EJECUTA la eliminación múltiple (se llama al confirmar en el modal)

  const eliminarSeleccionadosConfirmado = async () => {
    const ids = [...contactosSeleccionados];
    if (!ids.length) return;

    // cerrar modal al instante
    setConfirmOpen(false);
    setIsDeleting(true);
    setDeleteProgress(0);

    const toastId = toast.loading("Eliminando contactos... 0%");
    try {
      await eliminarContactosBatchConProgreso(ids, (done, total) => {
        const pct = Math.round((done / total) * 100);
        setDeleteProgress(pct);
        toast.update(toastId, {
          render: `Eliminando contactos... ${pct}%`,
          isLoading: true,
        });
      });

      setContactos((prev) => prev.filter((c) => !ids.includes(c.id!)));
      setContactosSeleccionados([]);

      toast.update(toastId, {
        render: "Contactos eliminados",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: "Error al eliminar",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reemplazo de manejarEliminar (individual) usando modal
  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;
    const contacto = contactos.find((c) => c.id === id);
    if (!contacto) return;

    setConfirmTitle("¿Eliminar este contacto?");
    setConfirmMessage(
      `Se eliminará a ${
        contacto.nombreCompleto || "este contacto"
      }. También se guardará en el historial.`
    );

    confirmActionRef.current = async () => {
      try {
        await agregarAHistorial(contacto);
        await eliminarContacto(id);
        setContactos(contactos.filter((c) => c.id !== id));
        toast.success("Contacto eliminado y guardado en el historial.");
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error("Error al eliminar el contacto.");
      } finally {
        setConfirmOpen(false);
      }
    };

    setConfirmOpen(true);
  };

  const manejarSubmit = async () => {
    const error = validarContacto(
      nuevoContacto,
      contactos,
      modoEdicion,
      idEdicion
    );
    if (error) return toast.error(error);
    const contactoMayusculas: Contacto = {
      primerNombre: nuevoContacto.primerNombre?.toUpperCase() || "",
      segundoNombre: nuevoContacto.segundoNombre?.toUpperCase() || "",
      primerApellido: nuevoContacto.primerApellido?.toUpperCase() || "",
      segundoApellido: nuevoContacto.segundoApellido?.toUpperCase() || "",
      area: nuevoContacto.area?.toUpperCase() || "",
      fechaAtencion: nuevoContacto.fechaAtencion || "",
      operador: nuevoContacto.operador?.toUpperCase() || "",
      telefono: nuevoContacto.telefono || "",
      marca: nuevoContacto.marca?.toUpperCase() || "",
      modelo: nuevoContacto.modelo?.toUpperCase() || "",
      serie: nuevoContacto.serie?.toUpperCase() || "",
      nombreCompleto: `${nuevoContacto.primerNombre || ""} ${
        nuevoContacto.segundoNombre || ""
      } ${nuevoContacto.primerApellido || ""} ${
        nuevoContacto.segundoApellido || ""
      }`
        .toUpperCase()
        .trim(),
    };

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
      console.error("Error al guardar:", error);
      toast.error("Ocurrió un error al guardar el contacto.");
    }
  };

  if (cargando)
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="w-full p-2">
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
              setNuevoContacto((prev) => ({
                ...prev,
                [name]: value.toUpperCase(),
              }));
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

        <div className="w-full mt-4 flex justify-between items-center">
          {contactosSeleccionados.length > 0 && (
            <button
              onClick={solicitarEliminarSeleccionados} // <- antes: eliminarSeleccionados
              className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110"
              title="Eliminar seleccionados"
            >
              <FaTrash size={20} />
            </button>
          )}

          <div className="text-sm text-gray-600">
            Total de contactos: {contactosFiltrados.length}
          </div>
        </div>

        <ConfirmDeleteModal
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          onConfirm={() => confirmActionRef.current()}
          onClose={() => setConfirmOpen(false)}
        />

        <div className="w-full mt-1 max-h-[600px] overflow-y-auto">
          <ContactTable
            contactos={contactosFiltrados}
            editarContacto={manejarEditar}
            eliminarContacto={manejarEliminar}
            contactosSeleccionados={contactosSeleccionados}
            toggleSeleccion={toggleSeleccion}
            toggleSeleccionTodos={toggleSeleccionTodos}
          />
        </div>

        <DeletingOverlay open={isDeleting} progress={deleteProgress} />
      </main>
    </div>
  );
}
