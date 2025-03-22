import React from "react";
import { Contacto } from "../types";

interface ContactRowProps {
  contacto: Contacto;
  editarContacto: () => void;
  eliminarContacto: () => void;
}

const ContactRow: React.FC<ContactRowProps> = ({
  contacto,
  editarContacto,
  eliminarContacto,
}) => {
  return (
    <tr className="border-b hover:bg-gray-100 transition duration-300">
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
      <td className="px-4 py-2 border flex space-x-2 justify-center">
        <button
          onClick={editarContacto}
          className="!bg-white !text-slate-600 !border-2 !border-slate-700 
                     !px-3 !py-1 !rounded-md !transition-all !duration-300 
                     hover:!bg-slate-300 hover:!text-white hover:!shadow-lg hover:!scale-105"
        >
          ✏️ Editar
        </button>
        <button
          onClick={eliminarContacto}
          className="!bg-white !text-red-600 !border-2 !border-red-600 
                     !px-3 !py-1 !rounded-md !transition-all !duration-300 
                     hover:!bg-red-600 hover:!text-white hover:!shadow-lg hover:!scale-105"
        >
          🗑️ Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ContactRow;
