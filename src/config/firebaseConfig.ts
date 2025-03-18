import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsAtvXK608p-qsJr6h5eukwNKcd0gsKYE",
  authDomain: "gestioncontactos-a145c.firebaseapp.com",
  projectId: "gestioncontactos-a145c",
  storageBucket: "gestioncontactos-a145c.appspot.com",
  messagingSenderId: "526517937231",
  appId: "1:526517937231:web:2d45f0f12754d0d8e8b63a",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
