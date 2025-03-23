import React from "react";
import { Contacto } from "../types";

interface ContactRowProps {
  contacto: Contacto;
  editarContacto: (contacto: Contacto) => void;
  eliminarContacto: (id: string | undefined) => void;
  seleccionado: boolean;
  toggleSeleccion: (id: string) => void;
}

const ContactRow: React.FC<ContactRowProps> = ({
  contacto,
  editarContacto,
  eliminarContacto,
  seleccionado,
  toggleSeleccion,
}) => {
  return (
    <tr className="border-b hover:bg-gray-100 transition duration-300">
      <td className="px-4 py-2 border text-center">
        <input
          type="checkbox"
          checked={seleccionado}
          onChange={() => toggleSeleccion(contacto.id!)}
        />
      </td>
      <td className="px-4 py-2 border">{contacto.primerNombre}</td>
      <td className="px-4 py-2 border">{contacto.segundoNombre}</td>
      <td className="px-4 py-2 border">{contacto.primerApellido}</td>
      <td className="px-4 py-2 border">{contacto.segundoApellido}</td>
      <td className="px-4 py-2 border">{contacto.dni}</td>
      <td className="px-4 py-2 border">{contacto.telefono}</td>
      <td className="px-4 py-2 border">{contacto.email}</td>
      <td className="px-4 py-2 border">{contacto.cargo}</td>
      <td className="px-4 py-2 border">{contacto.area}</td>
      <td className="px-4 py-2 border">{contacto.supervisor}</td>
      <td className="px-4 py-2 border text-center space-x-2">
        <button
          onClick={() => editarContacto(contacto)}
          className="text-blue-600 hover:underline"
        >
          Editar
        </button>
        <button
          onClick={() => eliminarContacto(contacto.id)}
          className="text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ContactRow;
