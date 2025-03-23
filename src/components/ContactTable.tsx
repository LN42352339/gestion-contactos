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
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-red-500 text-white">
          <tr>
            <th className="px-4 py-2 border">
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={toggleSeleccionTodos}
              />
            </th>
            <th className="px-4 py-2 border">Primer Nombre</th>
            <th className="px-4 py-2 border">Segundo Nombre</th>
            <th className="px-4 py-2 border">Apellido Paterno</th>
            <th className="px-4 py-2 border">Apellido Materno</th>
            <th className="px-4 py-2 border">DNI</th>
            <th className="px-4 py-2 border">Teléfono</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Cargo</th>
            <th className="px-4 py-2 border">Área</th>
            <th className="px-4 py-2 border">Supervisor</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
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
