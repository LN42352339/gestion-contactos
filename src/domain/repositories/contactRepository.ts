// src/domain/repositories/contactRepository.ts
import { Contacto } from "../entities/contact";

export interface ContactRepository {
  getAll(): Promise<Contacto[]>;
  create(contacto: Contacto): Promise<string>;
  update(id: string, contacto: Contacto): Promise<void>;
  delete(id: string): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
}
