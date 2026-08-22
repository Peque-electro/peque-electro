import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTtYfbeNy7z15Pj3Suli68mVGioMFU21E",
  authDomain: "peque-elektro.firebaseapp.com",
  projectId: "peque-elektro",
  storageBucket: "peque-elektro.firebasestorage.app",
  messagingSenderId: "873169424486",
  appId: "1:873169424486:web:e9f77cb2052aa06b3b9da7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CARGAR INFORMACIÓN DE ENVÍOS EN LA TIENDA ---
async function cargarInfoEnviosTienda() {
  try {
    const docRef = doc(db, "configuracion", "envios");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const elemPuntos = document.getElementById("info-puntos");
      const elemCorreo = document.getElementById("info-correo");
      const elemCondicion = document.getElementById("info-condicion");

      if (elemPuntos && data.puntos) elemPuntos.textContent = data.puntos;
      if (elemCorreo && data.correo) elemCorreo.textContent = data.correo;
      if (elemCondicion && data.condicion) elemCondicion.textContent = data.condicion;
    }
  } catch (error) {
    console.error("Error al cargar la información de envíos:", error);
  }
}

// Ejecutar al cargar la tienda
cargarInfoEnviosTienda();