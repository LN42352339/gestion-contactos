import { Contacto } from "../types";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export function exportarContactosVCF(contactos: Contacto[]) {
  if (contactos.length === 0) {
    toast.warn("No hay contactos para exportar.");
    return;
  }

  let contenidoVCF = "";
  contactos.forEach((c) => {
    contenidoVCF += `BEGIN:VCARD\nVERSION:3.0\n`;
    contenidoVCF += `FN:${c.primerNombre} ${c.segundoNombre} ${c.primerApellido} ${c.segundoApellido}\n`;
    contenidoVCF += `TEL;TYPE=CELL:${c.telefono}\n`;
    if (c.email) contenidoVCF += `EMAIL:${c.email}\n`;
    contenidoVCF += `END:VCARD\n`;
  });

  const blob = new Blob([contenidoVCF], { type: "text/vcard;charset=utf-8" });
  descargarArchivo(blob, "vcf");
}

export function exportarContactosCSV(contactos: Contacto[]) {
  if (contactos.length === 0) {
    toast.warn("No hay contactos para exportar.");
    return;
  }

  const encabezados: (keyof Contacto)[] = [
    "primerNombre",
    "segundoNombre",
    "primerApellido",
    "segundoApellido",
    "dni",
    "telefono",
    "email",
    "cargo",
    "area",
    "supervisor",
  ];

  const csvContenido = [
    encabezados.join(","), // encabezado CSV
    ...contactos.map((contacto) =>
      encabezados
        .map((campo) => {
          const valor = contacto[campo];
          return `"${valor ? String(valor).replace(/"/g, '""') : ""}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContenido], { type: "text/csv;charset=utf-8;" });
  descargarArchivo(blob, "csv");
}

export function exportarContactosExcel(contactos: Contacto[]) {
  if (contactos.length === 0) {
    toast.warn("No hay contactos para exportar.");
    return;
  }

  const hoja = XLSX.utils.json_to_sheet(contactos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Contactos");

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `contactos_seleccionados_${fecha}.xlsx`);
}

// Función compartida para descargar archivos
function descargarArchivo(blob: Blob, tipo: "vcf" | "csv") {
  const enlace = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `contactos_seleccionados_${fecha}.${tipo}`;
  enlace.click();
}
