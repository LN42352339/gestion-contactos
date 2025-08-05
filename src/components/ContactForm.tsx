// src/components/ContactForm.tsx
import React from "react";
import { Contacto } from "../types";

interface ContactFormProps {
  contacto: Contacto;
  modoEdicion: boolean;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarSubmit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contacto,
  modoEdicion,
  manejarCambio,
  manejarSubmit,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); manejarSubmit(); }}>
      <h3 className="text-2xl font-bold mb-4 text-slate-700 text-center">
        {modoEdicion ? "Editar Contacto" : "Nuevo Contacto"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="primerNombre"
          placeholder="Primer Nombre"
          value={contacto.primerNombre}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="segundoNombre"
          placeholder="Segundo Nombre (opcional)"
          value={contacto.segundoNombre}
          onChange={manejarCambio}
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="primerApellido"
          placeholder="Primer Apellido"
          value={contacto.primerApellido}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="segundoApellido"
          placeholder="Segundo Apellido (opcional)"
          value={contacto.segundoApellido}
          onChange={manejarCambio}
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="area"
          placeholder="Área"
          value={contacto.area}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="date"
          name="fechaAtencion"
          value={contacto.fechaAtencion}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="operador"
          placeholder="Operador"
          value={contacto.operador}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono (9 dígitos)"
          value={contacto.telefono}
          onChange={manejarCambio}
          required
          pattern="[0-9]{9}"
          maxLength={9}
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="marca"
          placeholder="Marca del equipo"
          value={contacto.marca}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="modelo"
          placeholder="Modelo del equipo"
          value={contacto.modelo}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="serie"
          placeholder="Serie del equipo"
          value={contacto.serie}
          onChange={manejarCambio}
          required
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
        >
          {modoEdicion ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
