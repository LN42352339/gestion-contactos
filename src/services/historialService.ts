import { db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Contacto } from "../types";

export const agregarAHistorial = async (contacto: Contacto) => {
  if (!contacto.id) {
    throw new Error("El contacto no tiene un ID definido.");
  }

  const docRef = doc(db, "historialContactos", contacto.id); // ✅ contacto.id es string garantizado
  await setDoc(docRef, {
    ...contacto,
    eliminadoEn: new Date().toISOString(),
  });
};
