import { db } from "../config/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Contacto } from "../types";

// Obtener todos los contactos
export const obtenerContactos = async (): Promise<Contacto[]> => {
  const querySnapshot = await getDocs(collection(db, "contactos"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Contacto[];
};

// Agregar un nuevo contacto
export const agregarContacto = async (contacto: Contacto): Promise<string> => {
  const docRef = await addDoc(collection(db, "contactos"), contacto);
  return docRef.id;
};

// Editar contacto
export const actualizarContacto = async (id: string, contacto: Contacto) => {
  const datosActualizados = { ...contacto };
  delete datosActualizados.id; // Eliminamos el id para que Firestore no lo guarde
  await updateDoc(doc(db, "contactos", id), datosActualizados);
};

// Eliminar contacto
export const eliminarContacto = async (id: string) => {
  await deleteDoc(doc(db, "contactos", id));
};
