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
    <div className="w-full mt-6 shadow-lg rounded-lg">
      {/* Contenedor con scroll vertical + horizontal */}
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto rounded-lg">
        <table className="min-w-[1000px] w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-red-500 text-white text-xs uppercase sticky top-0 z-10 shadow-md">
            <tr>
              <th className="px-1 py-1 border text-xs">
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={toggleSeleccionTodos}
                />
              </th>
              <th className="px-1 py-1 border text-xs">Nombre completo</th>
               <th className="px-1 py-1 border text-xs">Teléfono</th>
              <th className="px-1 py-1 border text-xs">Área</th>
              <th className="px-1 py-1 border text-xs">Marca</th>
              <th className="px-1 py-1 border text-xs">Modelo</th>
              <th className="px-1 py-1 border text-xs">Serie</th>
              <th className="px-1 py-1 border text-xs">Operador</th>
              <th className="px-1 py-1 border text-xs">Fecha Atención</th>
              <th className="px-1 py-1 border text-xs">Acciones</th>
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
    </div>
  );
};

export default ContactTable;
