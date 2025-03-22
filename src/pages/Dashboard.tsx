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

export default function Dashboard() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const cargarContactos = async () => {
      const contactosLista = await obtenerContactos();
      setContactos(contactosLista);
    };
    cargarContactos();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nuevoValor = name === "email" ? value : value.toUpperCase();

    setNuevoContacto((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));
  };

  const limpiarFormulario = () => {
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
    setModoEdicion(false);
    setIdEdicion(null);
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

    if (!/^\d{8}$/.test(nuevoContacto.dni)) {
      toast.error("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    if (!/^\d{9}$/.test(nuevoContacto.telefono)) {
      toast.error("El teléfono debe tener exactamente 9 dígitos.");
      return;
    }

    if (nuevoContacto.email.trim() !== "") {
      const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(nuevoContacto.email);
      if (!emailValido) {
        toast.error("El correo electrónico no es válido.");
        return;
      }
    }

    const dniDuplicado = contactos.some(
      (c) => c.dni === nuevoContacto.dni && (!modoEdicion || c.id !== idEdicion)
    );

    const telefonoDuplicado = contactos.some(
      (c) =>
        c.telefono === nuevoContacto.telefono &&
        (!modoEdicion || c.id !== idEdicion)
    );

    if (dniDuplicado) {
      toast.error("El DNI ya está registrado.");
      return;
    }

    if (telefonoDuplicado) {
      toast.error("El número de teléfono ya está registrado.");
      return;
    }

    try {
      if (modoEdicion && idEdicion) {
        await actualizarContacto(idEdicion, nuevoContacto);
        setContactos(
          contactos.map((c) =>
            c.id === idEdicion ? { ...nuevoContacto, id: idEdicion } : c
          )
        );
        toast.success("✅ Contacto actualizado exitosamente.");
      } else {
        const id = await agregarContacto(nuevoContacto);
        setContactos([...contactos, { ...nuevoContacto, id }]);
        toast.success("✅ Contacto agregado exitosamente.");
      }

      limpiarFormulario();
    } catch (error) {
      console.error("❌ Error al agregar/editar contacto:", error);
      toast.error("Ocurrió un error al procesar el contacto.");
    }
  };

  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;

    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este contacto?");
    if (!confirmar) {
      toast.info("Eliminación cancelada.");
      return;
    }

    await eliminarContacto(id);
    setContactos(contactos.filter((c) => c.id !== id));
    toast.info("Contacto eliminado correctamente.");
  };

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const accesosRapidos = [
    { label: "Agregar", img: "https://img.icons8.com/ios-filled/50/add-user-group-man-man.png" },
    { label: "Productos", img: "https://img.icons8.com/ios-filled/50/shopping-cart.png" },
    { label: "Cupones", img: "https://img.icons8.com/ios-filled/50/coupon.png" },
    { label: "Usuarios", img: "https://img.icons8.com/ios-filled/50/user-group-man-man.png" },
    { label: "Settings", img: "https://img.icons8.com/ios-filled/50/settings.png" },
    { label: "Cuenta", img: "https://img.icons8.com/ios-filled/50/user.png" },
  ];

  const contactosFiltrados = contactos.filter((contacto) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      contacto.primerNombre.toLowerCase().includes(searchTerm) ||
      contacto.segundoNombre.toLowerCase().includes(searchTerm) ||
      contacto.primerApellido.toLowerCase().includes(searchTerm) ||
      contacto.segundoApellido.toLowerCase().includes(searchTerm) ||
      contacto.area.toLowerCase().includes(searchTerm) ||
      contacto.telefono.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="w-full p-6">
        <ToastContainer position="top-center" autoClose={3000} />
        <h2 className="text-3xl font-bold text-center text-slate-500 mb-6">
          Gestión de Contactos
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {accesosRapidos.map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded p-4 flex flex-col items-center hover:shadow-lg transition"
            >
              <img src={item.img} alt={item.label} className="mb-2 h-10 w-10" />
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-white p-6 transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
          <ContactForm
            contacto={nuevoContacto}
            manejarCambio={manejarCambio}
            manejarSubmit={manejarSubmit}
            modoEdicion={modoEdicion}
          />
        </div>

        <div className="w-full mt-4">
          <input
            type="text"
            placeholder="Buscar por nombres o apellidos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border border-gray-300 p-2 w-full rounded-md"
          />
        </div>

        <div className="w-full mt-8">
          <ContactTable
            contactos={contactosFiltrados}
            editarContacto={manejarEditar}
            eliminarContacto={manejarEliminar}
          />
          <div className="w-full mt-4 text-right text-sm text-gray-600">
            Total de contactos: {contactosFiltrados.length}
          </div>
        </div>
      </main>
    </div>
  );
}
