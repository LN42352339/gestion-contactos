export interface Contacto {
  id?: string;
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
}

export interface ContactoConHistorial extends Contacto {
  eliminadoEn: string;
}
