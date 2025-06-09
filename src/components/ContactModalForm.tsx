import React from "react";
import ContactForm from "./ContactForm";
import { Contacto } from "../types";

interface ContactModalFormProps {
  contacto: Contacto;
  modoEdicion: boolean;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarSubmit: () => void;
  onClose: () => void;
}

const ContactModalForm: React.FC<ContactModalFormProps> = ({
  contacto,
  modoEdicion,
  manejarCambio,
  manejarSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-white/40 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl relative">
        <button
          className="absolute top-2 right-2 text-red-500 font-bold text-xl hover:text-red-700"
          onClick={onClose}
        >
          ✖
        </button>
        <ContactForm
          contacto={contacto}
          manejarCambio={manejarCambio}
          manejarSubmit={manejarSubmit}
          modoEdicion={modoEdicion}
        />
      </div>
    </div>
  );
};

export default ContactModalForm;
