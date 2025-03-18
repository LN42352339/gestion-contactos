import React from "react";

interface ContactFormProps {
  contacto: {
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    dni: string;
    telefono: string;
    email: string;
    cargo: string;
    area: string;
    supervisor: string;
  };
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarSubmit: () => void;
  modoEdicion: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contacto,
  manejarCambio,
  manejarSubmit,
  modoEdicion,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        {modoEdicion ? "✏️ Editar Contacto" : "➕ Agregar Contacto"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="primerNombre"
          placeholder="Primer Nombre"
          value={contacto.primerNombre}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="segundoNombre"
          placeholder="Segundo Nombre"
          value={contacto.segundoNombre}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="primerApellido"
          placeholder="Primer Apellido"
          value={contacto.primerApellido}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="segundoApellido"
          placeholder="Segundo Apellido"
          value={contacto.segundoApellido}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={contacto.dni}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={contacto.telefono}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={contacto.email}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="cargo"
          placeholder="Cargo"
          value={contacto.cargo}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="area"
          placeholder="Área"
          value={contacto.area}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="supervisor"
          placeholder="Supervisor"
          value={contacto.supervisor}
          onChange={manejarCambio}
          className="border rounded-md p-2 w-full"
        />
      </div>

      <button
        onClick={manejarSubmit}
        className={`mt-4 w-full py-2 text-white font-bold rounded-md transition duration-300 ${
          modoEdicion ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {modoEdicion ? "✏️ Actualizar Contacto" : "➕ Agregar Contacto"}
      </button>
    </div>
  );
};

export default ContactForm;
