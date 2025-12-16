// src/presentation/views/Dashboard.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaRegEdit, FaPrint, FaTrash } from "react-icons/fa";
import ContactTable from "../components/ContactTable";
import ExportModal from "../components/ExportModal";
import ContactModalForm from "../components/ContactModalForm";
import QuickActions from "../components/QuickActions";
import DeletingOverlay from "../components/DeletingOverlay";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Contacto } from "../../domain/entities/contact";
import {
  obtenerContactos,
  agregarContacto,
  actualizarContacto,
  eliminarContacto,
  eliminarContactosBatchConProgreso,
} from "../../data/datasources/contactService";
import { agregarAHistorial } from "../../data/datasources/historialService";
import {
  exportarContactosVCF,
  exportarContactosCSV,
  exportarContactosExcel,
} from "../../utils/exportUtils";
import { validarContacto } from "../../utils/formUtils";
import cargandoLogo from "../../assets/img/cargando.webp";
import "../../index.css";
import "react-toastify/dist/ReactToastify.css";

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

  // Modal de confirmación reutilizable
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string>("¿Eliminar?");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const confirmActionRef = useRef<() => void | Promise<void>>(() => { });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);

  // ✅ Solo queda el modal para Agregar
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);
  const [contactosSeleccionados, setContactosSeleccionados] = useState<string[]>(
    []
  );

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

  // ⬇️ Acciones rápidas (Perfil vuelve a ser pasivo, sin onClick)
  const accesosRapidos = [
    {
      label: "Agregar",
      img: "https://img.icons8.com/ios-filled/50/add-user-group-man-man.png",
      onClick: () => setMostrarModalAgregar(true),
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
      onClick: () => navigate("/perfil"),
    },

  ];

  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  useEffect(() => {
    const cargarContactos = async () => {
      try {
        const crudos = categoriaFiltro
          ? await obtenerContactos(categoriaFiltro)
          : await obtenerContactos();

        const contactosLista = crudos.map((c) => ({
          ...c,
          telefono: String(c.telefono ?? ""),
          serie: String(c.serie ?? ""),
        }));

        setContactos(contactosLista);
      } catch (error) {
        console.error("Error al cargar contactos:", error);
        toast.error("Error al cargar contactos.");
      } finally {
        setTimeout(() => setCargando(false), 500);
      }
    };

    cargarContactos();
  }, [categoriaFiltro]);

  // ✅ Importar (sin warning deprecated): usamos readAsArrayBuffer + XLSX.read({type:"array"})
  const manejarArchivo = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = async (evt: ProgressEvent<FileReader>) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const datos: Contacto[] = XLSX.utils.sheet_to_json(hoja);

      const nuevos: Contacto[] = [];
      let rechazados = 0;

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
          const telDigits = String(contacto.telefono ?? "").replace(/\D+/g, "");
          const serieDigits = String(contacto.serie ?? "").replace(/\D+/g, "");

          // ✅ teléfono 9 dígitos y serie/IMEI 15 dígitos EXACTOS
          if (!/^\d{9}$/.test(telDigits) || !/^\d{15}$/.test(serieDigits)) {
            rechazados++;
            continue;
          }

          const telExiste = contactos.some((c) => c.telefono === telDigits);
          if (telExiste) {
            rechazados++;
            continue;
          }

          const contactoSanitizado: Contacto = {
            primerNombre: String(contacto.primerNombre).toUpperCase(),
            segundoNombre: String(contacto.segundoNombre || "").toUpperCase(),
            primerApellido: String(contacto.primerApellido).toUpperCase(),
            segundoApellido: String(contacto.segundoApellido || "").toUpperCase(),
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
              return "01/01/1900";
            })(),
            operador: String(contacto.operador).toUpperCase(),
            telefono: telDigits,
            marca: String(contacto.marca).toUpperCase(),
            modelo: String(contacto.modelo).toUpperCase(),
            serie: serieDigits, // ✅ 15 dígitos exactos
            nombreCompleto: `${contacto.primerNombre} ${contacto.segundoNombre || ""} ${contacto.primerApellido} ${contacto.segundoApellido || ""}`
              .trim()
              .toUpperCase(),
          };

          const id = await agregarContacto(contactoSanitizado);
          nuevos.push({ ...contactoSanitizado, id });
        } else {
          rechazados++;
        }
      }

      setContactos((prev) => [...prev, ...nuevos]);

      if (nuevos.length > 0) {
        toast.success(`✅ Contactos importados correctamente: ${nuevos.length}`);
      } else {
        toast.warn("No se importó ningún contacto válido.");
      }

      if (rechazados > 0) {
        toast.info(`⚠️ Registros rechazados: ${rechazados} (por duplicado o IMEI/Teléfono inválido)`);
      }
    };

    reader.readAsArrayBuffer(archivo);
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

  const contactosFiltrados = contactos.filter((c) => {
    const q = String(searchQuery ?? "").trim().toLowerCase();
    if (!q) return true;

    const qDigits = q.replace(/\D+/g, "");

    const nombre = [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
      .map((v) => String(v ?? ""))
      .join(" ")
      .trim()
      .toLowerCase();

    const telDigits = String(c.telefono ?? "").replace(/\D+/g, "");
    const serieStr = String(c.serie ?? "");
    const serieLower = serieStr.toLowerCase();
    const serieDigits = serieStr.replace(/\D+/g, "");

    return (
      nombre.includes(q) ||
      (qDigits !== "" && telDigits.includes(qDigits)) ||
      serieLower.includes(q) ||
      (qDigits !== "" && serieDigits.includes(qDigits))
    );
  });

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
    setMostrarFormulario(true);
  };

  // Confirmación de eliminación múltiple
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

  const eliminarSeleccionadosConfirmado = async () => {
    const ids = [...contactosSeleccionados];
    if (!ids.length) return;

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

  // Eliminar individual con historial
  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;
    const contacto = contactos.find((c) => c.id === id);
    if (!contacto) return;

    setConfirmTitle("¿Eliminar este contacto?");
    setConfirmMessage(
      `Se eliminará a ${contacto.nombreCompleto || "este contacto"}. También se guardará en el historial.`
    );

    confirmActionRef.current = async () => {
      try {
        await agregarAHistorial(contacto);
        await eliminarContacto(id);
        setContactos((prev) => prev.filter((c) => c.id !== id));
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

  // Guardar (crear/editar)
  const manejarSubmit = async () => {
    const error = validarContacto(nuevoContacto, contactos, modoEdicion, idEdicion);
    if (error) return toast.error(error);

    // ✅ TELÉFONO solo dígitos y 9 exactos
    const telefonoDigits = String(nuevoContacto.telefono ?? "").replace(/\D+/g, "");
    if (!/^\d{9}$/.test(telefonoDigits)) {
      return toast.error("El teléfono debe contener exactamente 9 dígitos numéricos.");
    }

    // ✅ SERIE/IMEI solo dígitos y 15 exactos
    const serieDigits = String(nuevoContacto.serie ?? "").replace(/\D+/g, "");
    if (!/^\d{15}$/.test(serieDigits)) {
      return toast.error("El IMEI / Serie debe contener exactamente 15 dígitos numéricos.");
    }

    const contactoMayusculas: Contacto = {
      primerNombre: nuevoContacto.primerNombre?.toUpperCase() || "",
      segundoNombre: nuevoContacto.segundoNombre?.toUpperCase() || "",
      primerApellido: nuevoContacto.primerApellido?.toUpperCase() || "",
      segundoApellido: nuevoContacto.segundoApellido?.toUpperCase() || "",
      area: nuevoContacto.area?.toUpperCase() || "",
      fechaAtencion: nuevoContacto.fechaAtencion || "",
      operador: nuevoContacto.operador?.toUpperCase() || "",
      telefono: telefonoDigits,
      serie: serieDigits, // ✅ 15 dígitos exactos
      marca: nuevoContacto.marca?.toUpperCase() || "",
      modelo: nuevoContacto.modelo?.toUpperCase() || "",
      nombreCompleto: `${nuevoContacto.primerNombre || ""} ${nuevoContacto.segundoNombre || ""} ${nuevoContacto.primerApellido || ""} ${nuevoContacto.segundoApellido || ""}`
        .toUpperCase()
        .trim(),
    };

    try {
      if (modoEdicion && idEdicion) {
        await actualizarContacto(idEdicion, contactoMayusculas);
        setContactos((prev) =>
          prev.map((c) => (c.id === idEdicion ? { ...contactoMayusculas, id: idEdicion } : c))
        );
        toast.success("✅ Contacto actualizado exitosamente.");
      } else {
        const id = await agregarContacto(contactoMayusculas);
        setContactos((prev) => [...prev, { ...contactoMayusculas, id }]);
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

  // ➕ Flujo Manual (igual que antes)
  const abrirFormularioManual = () => {
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
  };

  // 🤖 Flujo Automático (protocolo VIISAN)
  const SCANNER_URI = "viisan://scan";
  const abrirScannerViisan = () => {
    toast.info("🔄 Intentando abrir VIISAN OfficeCam...", { autoClose: 3000 });
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = SCANNER_URI;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 2000);
      setTimeout(() => {
        window.location.href = SCANNER_URI;
      }, 100);
    } catch (err) {
      console.error("Error al abrir VIISAN:", err);
      toast.error("⚠️ No se pudo lanzar VIISAN (revisa instalación)", {
        autoClose: 5000,
      });
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <img src={cargandoLogo} alt="Logo" className="w-24 h-24 animate-pulse mb-4" />
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

              setNuevoContacto((prev) => {
                // ✅ SERIE/IMEI: solo números y máximo 15
                if (name === "serie") {
                  const digits = value.replace(/\D+/g, "").slice(0, 15);
                  return { ...prev, serie: digits };
                }

                // ✅ TELÉFONO: solo números y máximo 9
                if (name === "telefono") {
                  const digits = value.replace(/\D+/g, "").slice(0, 9);
                  return { ...prev, telefono: digits };
                }

                return { ...prev, [name]: value.toUpperCase() };
              });
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
                  ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
                  : contactos
              )
            }
            onExportCSV={() =>
              exportarContactosCSV(
                contactosSeleccionados.length > 0
                  ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
                  : contactos
              )
            }
            onExportExcel={() =>
              exportarContactosExcel(
                contactosSeleccionados.length > 0
                  ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
                  : contactos
              )
            }
          />
        )}

        {/* Modal: Agregar contacto */}
        {mostrarModalAgregar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Fondo oscuro */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMostrarModalAgregar(false)}
            />
            {/* Caja */}
            <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Agregar contacto
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Selecciona cómo deseas agregar un nuevo contacto:
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setMostrarModalAgregar(false);
                    abrirFormularioManual();
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 hover:bg-gray-50 active:scale-[0.99] transition"
                >
                  <FaRegEdit /> Manual
                </button>

                <button
                  onClick={() => {
                    setMostrarModalAgregar(false);
                    abrirScannerViisan();
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 text-white px-4 py-3 hover:bg-red-700 active:scale-[0.99] transition"
                >
                  <FaPrint /> Automático (VIISAN)
                </button>
              </div>

              <button
                onClick={() => setMostrarModalAgregar(false)}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}



        {/* ✅ FILTROS EN FORMATO TABS / SEGMENTED CONTROL */}
        {/* 🔎 BUSCAR + FILTRAR + TOTAL (estilo limpio) */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Buscador */}
            <div className="relative w-full md:flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombres, apellidos, teléfono o serie..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-sm text-gray-600">Total</span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                {contactosFiltrados.length}
              </span>
            </div>
          </div>

          {/* Chips de filtro */}
          <div className="mt-3 flex flex-wrap items-center gap-2">


            <button
              type="button"
              onClick={() => setCategoriaFiltro(null)}
              className={`px-2 py-0.5 text-xs rounded-md border transition

        ${categoriaFiltro === null
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Todos
            </button>

            <button
              type="button"
              onClick={() => setCategoriaFiltro("parlamento")}
              className={`px-2 py-0.5 text-xs rounded-md border transition
        ${categoriaFiltro === "parlamento"
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Parlamento
            </button>

            <button
              type="button"
              onClick={() => setCategoriaFiltro("congresal")}
              className={`px-2 py-0.5 text-xs rounded-mdborder transition
        ${categoriaFiltro === "congresal"
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Congresales
            </button>
          </div>
        </div>





        <div className="w-full mt-4 flex justify-between items-center">
          {contactosSeleccionados.length > 0 && (
            <button
              onClick={solicitarEliminarSeleccionados}
              className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110"
              title="Eliminar seleccionados"
            >
              <FaTrash size={20} />
            </button>
          )}

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
