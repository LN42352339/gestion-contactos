// src/utils/formUtils.ts
import { Contacto } from "../domain/entities/contact";

const digits = (v: unknown) => String(v ?? "").replace(/\D+/g, "");

type RequiredKeys =
  | "primerNombre"
  | "primerApellido"
  | "area"
  | "fechaAtencion"
  | "operador"
  | "telefono"
  | "marca"
  | "modelo"
  | "serie";

export function validarContacto(
  contacto: Contacto,
  contactos: Contacto[],
  modoEdicion: boolean,
  idEdicion: string | null
): string | null {
  // 1) Requeridos (tipado sin any)
  const camposObligatorios: Array<RequiredKeys> = [
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
    const valor = contacto[campo]; // tipo: Contacto[RequiredKeys]
    if (
      valor === undefined ||
      valor === null ||
      (typeof valor === "string" && valor.trim() === "")
    ) {
      return `El campo "${campo}" es obligatorio.`;
    }
  }

  // 2) Teléfono: exactamente 9 dígitos (Perú)
  const telNuevo = digits(contacto.telefono);
  if (telNuevo.length !== 9) {
    return "El teléfono debe tener exactamente 9 dígitos.";
  }

  // 3) Serie/IMEI normalizada
  const serieNuevoTxt = String(contacto.serie ?? "").trim().toUpperCase();
  const serieNuevoDig = digits(contacto.serie);

  // 4) Duplicados (ignorando el mismo registro en edición)
  const telDuplicado = contactos.some((c) => {
    if (modoEdicion && c.id === idEdicion) return false;
    return digits(c.telefono) === telNuevo;
  });
  if (telDuplicado) return "El número de teléfono ya está registrado.";

  const serieDuplicada = contactos.some((c) => {
    if (modoEdicion && c.id === idEdicion) return false;
    const sTxt = String(c.serie ?? "").trim().toUpperCase();
    const sDig = digits(c.serie);
    // duplicado si coincide por texto o por sólo dígitos (IMEI)
    return sTxt === serieNuevoTxt || (!!serieNuevoDig && sDig === serieNuevoDig);
  });
  if (serieDuplicada) return "La serie/IMEI ya está registrada.";

  // (Opcional) exigir IMEI de 15 dígitos:
  // if (serieNuevoDig && serieNuevoDig.length !== 15) {
  //   return "La serie/IMEI debe tener 15 dígitos.";
  // }

  return null;
}
