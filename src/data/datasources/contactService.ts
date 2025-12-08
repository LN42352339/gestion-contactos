// src/data/datasources/contactService.ts
// 👉 Puente entre la capa de presentación y los casos de uso

import { Contacto } from "../../domain/entities/contact";
import { FirebaseContactRepository } from "../repositories/firebaseContactRepository";

import { GetAllContactsUseCase } from "../../domain/usecases/getAllContacts";
import { CreateContactUseCase } from "../../domain/usecases/createContact";
import { UpdateContactUseCase } from "../../domain/usecases/updateContact";
import { DeleteContactUseCase } from "../../domain/usecases/deleteContact";

// ✅ Repositorio concreto
const contactRepository = new FirebaseContactRepository();

// ✅ Casos de uso
const getAllContactsUseCase = new GetAllContactsUseCase(contactRepository);
const createContactUseCase = new CreateContactUseCase(contactRepository);
const updateContactUseCase = new UpdateContactUseCase(contactRepository);
const deleteContactUseCase = new DeleteContactUseCase(contactRepository);

// ---------------------------------------------------------
// 🔹 Funciones que usa tu Dashboard / History / Statistics
// ---------------------------------------------------------

export async function obtenerContactos(): Promise<Contacto[]> {
  return getAllContactsUseCase.execute();
}

export async function agregarContacto(contacto: Contacto): Promise<string> {
  return createContactUseCase.execute(contacto);
}

export async function actualizarContacto(
  id: string,
  contacto: Contacto
): Promise<void> {
  return updateContactUseCase.execute(id, contacto);
}

export async function eliminarContacto(id: string): Promise<void> {
  return deleteContactUseCase.execute(id);
}

/**
 * 🗑️ Eliminación múltiple con progreso
 */
export async function eliminarContactosBatchConProgreso(
  ids: string[],
  onProgress: (done: number, total: number) => void
): Promise<void> {
  const total = ids.length;
  let done = 0;

  for (const id of ids) {
    await deleteContactUseCase.execute(id);
    done++;
    onProgress(done, total);
  }
}
