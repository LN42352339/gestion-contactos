// src/domain/usecases/getAllContacts.ts
import { ContactRepository } from "../repositories/contactRepository";
import { Contacto } from "../entities/contact";

// 🔹 Caso de uso para obtener todos los contactos
export class GetAllContactsUseCase {
  private readonly repository: ContactRepository;

  constructor(repository: ContactRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Contacto[]> {
    // Simplemente delega al repositorio
    return this.repository.getAll();
  }
}
