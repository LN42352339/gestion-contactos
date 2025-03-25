import React from "react";
import { Contacto } from "../types";
import { Pencil, Trash2 } from "lucide-react";

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
    <tr className="border-b hover:bg-gray-100 transition duration-200 text-sm">
      <td className="px-2 py-0.5 border text-xs">
        <input
          type="checkbox"
          checked={seleccionado}
          onChange={() => toggleSeleccion(contacto.id!)}
        />
      </td>
      <td className="px-1 py-0.5 border text-xs">{contacto.primerNombre}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.segundoNombre}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.primerApellido}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.segundoApellido}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.dni}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.telefono}</td>
      <td className="px-2 py-1 border break-words max-w-[185px]">
        {contacto.email}
      </td>
      <td className="px-1 py-0.5 border text-xs">{contacto.cargo}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.area}</td>
      <td className="px-1 py-0.5 border text-xs">{contacto.supervisor}</td>
      <td className="px-2 py-1 border text-center space-x-1">
        <button
          onClick={() => editarContacto(contacto)}
          className="text-blue-600 hover:text-blue-800"
          title="Editar"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => eliminarContacto(contacto.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default ContactRow;
