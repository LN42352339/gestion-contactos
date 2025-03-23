// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  obtenerContactos,
  agregarContacto,
  actualizarContacto,
  eliminarContacto,
} from "../services/contactService";
import ContactForm from "../components/ContactForm";
import ContactTable from "../components/ContactTable";
import { Contacto } from "../types";
import Navbar from "../components/Navbar";
import "../index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [cargando, setCargando] = useState(true);
  const [mostrarModalExportar, setMostrarModalExportar] = useState(false);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState(1);
  const contactosPorPagina = 10;
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
      label: "Buscar Contacto",
      img: "https://img.icons8.com/ios-filled/50/search-contacts.png",
    },
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
    },

    {
      label: "Cuenta",
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

  const exportarContactosVCF = () => {
    const seleccionados =
      contactosSeleccionados.length > 0
        ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
        : contactos;

    if (seleccionados.length === 0) {
      toast.warn("No hay contactos seleccionados para exportar.");
      return;
    }

    let contenidoVCF = "";
    seleccionados.forEach((c) => {
      contenidoVCF += `BEGIN:VCARD\nVERSION:3.0\n`;
      contenidoVCF += `FN:${c.primerNombre} ${c.segundoNombre} ${c.primerApellido} ${c.segundoApellido}\n`;
      contenidoVCF += `TEL;TYPE=CELL:${c.telefono}\n`;
      if (c.email) contenidoVCF += `EMAIL:${c.email}\n`;
      contenidoVCF += `END:VCARD\n`;
    });

    const blob = new Blob([contenidoVCF], { type: "text/vcard;charset=utf-8" });
    const enlace = document.createElement("a");
    const fecha = new Date().toISOString().slice(0, 10);
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `contactos_seleccionados_${fecha}.vcf`;
    enlace.click();
    setMostrarModalExportar(false);
  };

  const exportarContactosCSV = () => {
    const seleccionados =
      contactosSeleccionados.length > 0
        ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
        : contactos;

    if (seleccionados.length === 0) {
      toast.warn("No hay contactos seleccionados para exportar.");
      return;
    }

    const encabezados: (keyof Contacto)[] = [
      "primerNombre",
      "segundoNombre",
      "primerApellido",
      "segundoApellido",
      "dni",
      "telefono",
      "email",
      "cargo",
      "area",
      "supervisor",
    ];

    const csvContenido = [
      encabezados.join(","), // encabezado CSV
      ...seleccionados.map((contacto) =>
        encabezados
          .map((campo) => {
            const valor = contacto[campo];
            return `"${valor ? String(valor).replace(/"/g, '""') : ""}"`; // escapamos comillas y nulos
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContenido], { type: "text/csv;charset=utf-8;" });
    const enlace = document.createElement("a");
    const fecha = new Date().toISOString().slice(0, 10);
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `contactos_seleccionados_${fecha}.csv`;
    enlace.click();
    setMostrarModalExportar(false);
  };

  const exportarContactosExcel = () => {
    const seleccionados =
      contactosSeleccionados.length > 0
        ? contactos.filter((c) => contactosSeleccionados.includes(c.id || ""))
        : contactos;

    if (seleccionados.length === 0) {
      toast.warn("No hay contactos seleccionados para exportar.");
      return;
    }

    const hoja = XLSX.utils.json_to_sheet(seleccionados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Contactos");

    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `contactos_seleccionados_${fecha}.xlsx`);
    setMostrarModalExportar(false);
  };

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
    for (const id of contactosSeleccionados) {
      await eliminarContacto(id);
    }
    setContactos(
      contactos.filter((c) => !contactosSeleccionados.includes(c.id!))
    );
    setContactosSeleccionados([]);
    toast.success("Contactos eliminados correctamente.");
  };

  const contactosFiltrados = contactos.filter((contacto) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      String(contacto.primerNombre || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(contacto.segundoNombre || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(contacto.primerApellido || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(contacto.segundoApellido || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(contacto.area || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(contacto.telefono || "")
        .toLowerCase()
        .includes(searchTerm)
    );
  });

  const totalPaginas = Math.ceil(
    contactosFiltrados.length / contactosPorPagina
  );
  const indiceUltimo = paginaActual * contactosPorPagina;
  const indicePrimero = indiceUltimo - contactosPorPagina;
  const contactosPaginados = contactosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
    setMostrarFormulario(true);
  };

  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este contacto?"
    );
    if (!confirmar) {
      toast.info("Eliminación cancelada.");
      return;
    }
    await eliminarContacto(id);
    setContactos(contactos.filter((c) => c.id !== id));
    toast.info("Contacto eliminado correctamente.");
  };

  const manejarSubmit = async () => {
    const camposObligatorios = [
      "primerNombre",
      "primerApellido",
      "segundoApellido",
      "dni",
      "telefono",
      "area",
    ];

    for (const campo of camposObligatorios) {
      if (!nuevoContacto[campo as keyof typeof nuevoContacto]?.trim()) {
        toast.warn(`El campo "${campo}" es obligatorio.`);
        return;
      }
    }

    if (!/^[0-9]{8}$/.test(nuevoContacto.dni)) {
      toast.error("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    if (!/^[0-9]{9}$/.test(nuevoContacto.telefono)) {
      toast.error("El teléfono debe tener exactamente 9 dígitos.");
      return;
    }

    if (
      nuevoContacto.email &&
      !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(nuevoContacto.email)
    ) {
      toast.error("El correo electrónico no es válido.");
      return;
    }

    const telefonoDuplicado = contactos.some(
      (c) =>
        c.telefono === nuevoContacto.telefono &&
        (!modoEdicion || c.id !== idEdicion)
    );
    if (telefonoDuplicado) {
      toast.error("El número de teléfono ya está registrado.");
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
          src="/src/assets/img/logod.png"
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
      <Navbar />
      <main className="w-full p-6">
        <ToastContainer position="top-center" autoClose={3000} />
        <h2 className="text-3xl font-bold text-center text-slate-600 mb-6">
          Gestión de Contactos
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {accesosRapidos.map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
              onClick={item.onClick}
            >
              <img src={item.img} alt={item.label} className="mb-2 h-10 w-10" />
              <span className="font-semibold text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {mostrarFormulario && (
          <div className="fixed inset-0 bg-white/40 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-red-500 font-bold text-xl hover:text-red-700"
                onClick={() => setMostrarFormulario(false)}
              >
                ✖
              </button>
              <ContactForm
                contacto={nuevoContacto}
                manejarCambio={(e) => {
                  const { name, value } = e.target;
                  const valor = name === "email" ? value : value.toUpperCase();
                  setNuevoContacto((prev) => ({ ...prev, [name]: valor }));
                }}
                manejarSubmit={manejarSubmit}
                modoEdicion={modoEdicion}
              />
            </div>
          </div>
        )}

        {mostrarModalExportar && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-center">
                Exportar contactos seleccionados
              </h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded w-full"
                  onClick={exportarContactosVCF}
                >
                  Exportar a VCF
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                  onClick={exportarContactosCSV}
                >
                  Exportar a CSV
                </button>

                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded w-full"
                  onClick={exportarContactosExcel}
                >
                  Exportar a Excel
                </button>
              </div>
              <button
                className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded w-full"
                onClick={() => setMostrarModalExportar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
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

        <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => cambiarPagina(i + 1)}
              className={`px-3 py-1 border rounded ${
                paginaActual === i + 1 ? "bg-red-500 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </main>
    </div>
  );
}
