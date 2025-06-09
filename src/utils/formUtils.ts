// src/utils/formUtils.ts
import { Contacto } from "../types";

export function validarContacto(
  contacto: Contacto,
  contactos: Contacto[],
  modoEdicion: boolean,
  idEdicion: string | null
): string | null {
  const camposObligatorios = [
    "primerNombre",
    "primerApellido",
    "segundoApellido",
    "dni",
    "telefono",
    "area",
  ];

  for (const campo of camposObligatorios) {
    if (!contacto[campo as keyof typeof contacto]?.trim()) {
      return `El campo "${campo}" es obligatorio.`;
    }
  }

  if (!/^[0-9]{8}$/.test(contacto.dni)) {
    return "El DNI debe tener exactamente 8 dígitos.";
  }

  if (!/^[0-9]{9}$/.test(contacto.telefono)) {
    return "El teléfono debe tener exactamente 9 dígitos.";
  }

  if (contacto.email && !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(contacto.email)) {
    return "El correo electrónico no es válido.";
  }

  const telefonoDuplicado = contactos.some(
    (c) =>
      c.telefono === contacto.telefono && (!modoEdicion || c.id !== idEdicion)
  );

  if (telefonoDuplicado) {
    return "El número de teléfono ya está registrado.";
  }

  return null;
}
