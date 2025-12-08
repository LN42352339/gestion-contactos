// src/data/repositories/firebaseContactRepository.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

import { Contacto } from "../../domain/entities/contact";
import { ContactRepository } from "../../domain/repositories/contactRepository";

export class FirebaseContactRepository implements ContactRepository {
  private collectionRef = collection(db, "contactos");

  async getAll(): Promise<Contacto[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Contacto, "id">),
    }));
  }

  async create(contacto: Contacto): Promise<string> {
    const { id: _, ...contactoSinId } = contacto;
    const result = await addDoc(this.collectionRef, contactoSinId);
    return result.id;
  }

  async update(id: string, contacto: Contacto): Promise<void> {
    const ref = doc(this.collectionRef, id);

    // 🔴 IMPORTANTE: Firestore no acepta el campo "id" dentro del update
    const { id: _, ...contactoSinId } = contacto;

    await updateDoc(ref, contactoSinId);
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.collectionRef, id);
    await deleteDoc(ref);
  }

  async deleteBatch(ids: string[]): Promise<void> {
    const batch = writeBatch(db);

    ids.forEach((id) => {
      const ref = doc(this.collectionRef, id);
      batch.delete(ref);
    });

    await batch.commit();
  }
}
