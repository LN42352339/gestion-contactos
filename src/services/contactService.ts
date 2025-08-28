// src/services/contactService.ts
import { db } from "../config/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { Contacto } from "../types";

// ============================
// Obtener todos los contactos
// ============================
export const obtenerContactos = async (): Promise<Contacto[]> => {
  const querySnapshot = await getDocs(collection(db, "contactos"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Contacto[];
};

// ============================
// Agregar un nuevo contacto
// ============================
export const agregarContacto = async (contacto: Contacto): Promise<string> => {
  const docRef = await addDoc(collection(db, "contactos"), contacto);
  return docRef.id;
};

// ============================
// Editar contacto
// ============================
export const actualizarContacto = async (id: string, contacto: Contacto) => {
  const datosActualizados = { ...contacto };
  delete datosActualizados.id; // Firestore no debe guardar el id dentro del documento
  await updateDoc(doc(db, "contactos", id), datosActualizados);
};

// ============================
// Eliminar contacto individual
// ============================
export const eliminarContacto = async (id: string) => {
  await deleteDoc(doc(db, "contactos", id));
};

// =======================================================
// Eliminar múltiples contactos (con batches y progreso)
// Firestore permite máx 500 operaciones por batch
// =======================================================
export async function eliminarContactosBatchConProgreso(
  ids: string[],
  onStep?: (done: number, total: number) => void
) {
  if (!ids.length) return;

  const CHUNK = 450; // seguridad < 500
  let done = 0;

  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const batch = writeBatch(db);

    for (const id of slice) {
      batch.delete(doc(db, "contactos", id));
    }

    // ✅ try/catch bien cerrado
    try {
      await batch.commit();
      done += slice.length;
      onStep?.(done, ids.length);
    } catch (e) {
      console.error("Error eliminando batch:", e);
      throw e; // lanzamos para que la UI muestre error
    }
  }
}
