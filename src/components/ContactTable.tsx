import React from "react";
import ContactRow from "./ContactRow";
import { Contacto } from "../types";

interface ContactTableProps {
  contactos: Contacto[];
  editarContacto: (contacto: Contacto) => void;
  eliminarContacto: (id: string | undefined) => void;
  contactosSeleccionados: string[];
  toggleSeleccion: (id: string) => void;
  toggleSeleccionTodos: () => void;
}

const ContactTable: React.FC<ContactTableProps> = ({
  contactos,
  editarContacto,
  eliminarContacto,
  contactosSeleccionados,
  toggleSeleccion,
  toggleSeleccionTodos,
}) => {
  const todosSeleccionados = contactos.every((c) =>
    contactosSeleccionados.includes(c.id || "")
  );

  return (
    <div className="overflow-x-auto mt-6 shadow-lg rounded-lg w-full">
      {/* Contenedor con scroll horizontal para pantallas pequeñas */}
      <table className="min-w-[900px] w-full bg-white border border-gray-200 text-sm">
        {/* Cabecera con estilo más compacto */}
        <thead className="bg-red-500 text-white text-xs uppercase">
          <tr>
          <th className="px-1 py-1 border text-xs">

              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={toggleSeleccionTodos}
              />
            </th>
            <th className="px-0 py-2 border text-xs">Nombre</th>
            <th className="px-0 py-1 border text-xs">S. Nombre</th>
            <th className="px-0 py-1 border text-xs">Ap. Paterno</th>
            <th className="px-0 py-1 border text-xs">Ap. Materno</th>
            <th className="px-0 py-1 border text-xs">DNI</th>
            <th className="px-0 py-1 border text-xs">Teléfono</th>
            <th className="px-0 py-1 border text-xs">Email</th>
            <th className="px-0 py-1 border text-xs">Cargo</th>
            <th className="px-0 py-1 border text-xs">Área</th>
            <th className="px-0 py-1 border text-xs">Supervisor</th>
            <th className="px-0 py-1 border text-xs">Acciones</th>
          </tr>
        </thead>

        {/* Cuerpo de la tabla */}
        <tbody>
          {contactos.map((contacto) => (
            <ContactRow
              key={contacto.id}
              contacto={contacto}
              editarContacto={editarContacto}
              eliminarContacto={eliminarContacto}
              seleccionado={contactosSeleccionados.includes(contacto.id || "")}
              toggleSeleccion={toggleSeleccion}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;
