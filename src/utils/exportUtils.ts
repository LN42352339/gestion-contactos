import { Contacto } from "../types";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

// Exportar a VCF
export function exportarContactosVCF(contactos: Contacto[]) {
  if (contactos.length === 0) {
    toast.warn("No hay contactos para exportar.");
    return;
  }

  let contenidoVCF = "";
  contactos.forEach((c) => {
    const nombreCompleto = c.nombreCompleto || `${c.primerNombre} ${c.segundoNombre ?? ""} ${c.primerApellido} ${c.segundoApellido ?? ""}`.trim();

    contenidoVCF += `BEGIN:VCARD\nVERSION:3.0\n`;
    contenidoVCF += `FN:${nombreCompleto}\n`;
    contenidoVCF += `TEL;TYPE=CELL:${c.telefono}\n`;
    contenidoVCF += `END:VCARD\n`;
  });

  const blob = new Blob([contenidoVCF], { type: "text/vcard;charset=utf-8" });
  descargarArchivo(blob, "vcf");
}

// Exportar a CSV
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
    "nombreCompleto",
    "telefono",
    "area",
    "fechaAtencion",
    "operador",
    "marca",
    "modelo",
    "serie",
  ];

  const csvContenido = [
    encabezados.join(","),
    ...contactos.map((c) =>
      encabezados
        .map((campo) => {
          const valor = campo === "nombreCompleto"
            ? c.nombreCompleto || `${c.primerNombre} ${c.segundoNombre ?? ""} ${c.primerApellido} ${c.segundoApellido ?? ""}`.trim()
            : c[campo];
          return `"${valor ? String(valor).replace(/"/g, '""') : ""}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContenido], { type: "text/csv;charset=utf-8;" });
  descargarArchivo(blob, "csv");
}

// Exportar a Excel
export function exportarContactosExcel(contactos: Contacto[]) {
  if (contactos.length === 0) {
    toast.warn("No hay contactos para exportar.");
    return;
  }

  const contactosFiltrados = contactos.map((c) => ({
    primerNombre: c.primerNombre,
    segundoNombre: c.segundoNombre ?? "",
    primerApellido: c.primerApellido,
    segundoApellido: c.segundoApellido ?? "",
    nombreCompleto: c.nombreCompleto || `${c.primerNombre} ${c.segundoNombre ?? ""} ${c.primerApellido} ${c.segundoApellido ?? ""}`.trim(),
    telefono: c.telefono,
    area: c.area,
    fechaAtencion: c.fechaAtencion,
    operador: c.operador,
    marca: c.marca,
    modelo: c.modelo,
    serie: c.serie,
  }));

  const hoja = XLSX.utils.json_to_sheet(contactosFiltrados);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Contactos");

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `contactos_seleccionados_${fecha}.xlsx`);
}

// Función común para descargar archivos
function descargarArchivo(blob: Blob, tipo: "vcf" | "csv") {
  const enlace = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `contactos_seleccionados_${fecha}.${tipo}`;
  enlace.click();
}
