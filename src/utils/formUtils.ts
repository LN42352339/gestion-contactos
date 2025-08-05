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
    "area",
    "fechaAtencion",
    "operador",
    "telefono",
    "marca",
    "modelo",
    "serie",
  ];

  for (const campo of camposObligatorios) {
    const valor = contacto[campo as keyof Contacto];
    if (typeof valor === "string" && valor.trim() === "") {
      return `El campo "${campo}" es obligatorio.`;
    }
  }

  if (!/^[0-9]{9}$/.test(contacto.telefono)) {
    return "El teléfono debe tener exactamente 9 dígitos.";
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
