import { useEffect, useState } from "react";
import {
  obtenerContactos,
  agregarContacto,
  actualizarContacto,
  eliminarContacto,
} from "./services/contactService";
import ContactForm from "./components/ContactForm";
import ContactTable from "./components/ContactTable";
import { Contacto } from "./types";
import { Encabezado } from "./components/Encabezado";
import "./index.css";

function App() {
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
    setNuevoContacto({ ...nuevoContacto, [e.target.name]: e.target.value });
  };

  const manejarSubmit = async () => {
    try {
      if (modoEdicion && idEdicion) {
        await actualizarContacto(idEdicion, nuevoContacto);
        setContactos(
          contactos.map((c) =>
            c.id === idEdicion ? { ...nuevoContacto, id: idEdicion } : c
          )
        );
        setModoEdicion(false);
        setIdEdicion(null);
      } else {
        const id = await agregarContacto(nuevoContacto);
        setContactos([...contactos, { ...nuevoContacto, id }]);
      }

      // Reiniciamos el formulario con la nueva estructura
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
    } catch (error) {
      console.error("❌ Error al agregar/editar contacto:", error);
    }
  };

  const manejarEliminar = async (id: string | undefined) => {
    if (!id) return;
    await eliminarContacto(id);
    setContactos(contactos.filter((c) => c.id !== id));
  };

  const manejarEditar = (contacto: Contacto) => {
    setModoEdicion(true);
    setIdEdicion(contacto.id || null);
    setNuevoContacto(contacto);
  };

  // Manejo del input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtrar contactos por los cuatro campos de nombres y apellidos
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
      <Encabezado />

      <main className="w-full p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Gestión de Contactos</h2>

        <div className="w-full bg-white p-6">
          <ContactForm
            contacto={nuevoContacto}
            manejarCambio={manejarCambio}
            manejarSubmit={manejarSubmit}
            modoEdicion={modoEdicion}
          />
        </div>

        {/* Campo de búsqueda */}
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
        </div>
      </main>
    </div>
  );
}

export default App;
