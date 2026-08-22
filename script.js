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
// Leer Eslogan y Presentación Dinámica desde Firebase
async function cargarSloganDinamico() {
  try {
    const snap = await getDoc(doc(db, "configuracion", "slogan"));
    if (snap.exists()) {
      const d = snap.data();
      if (d.titulo) document.querySelector(".slogan-container h2").innerText = d.titulo;
      if (d.intro) document.querySelector(".slogan-intro").innerText = d.intro;
      
      const items = document.querySelectorAll(".slogan-list li");
      if (d.item1 && items[0]) items[0].innerHTML = `<i class="fa-solid fa-mug-hot"></i> ${d.item1}`;
      if (d.item2 && items[1]) items[1].innerHTML = `<i class="fa-solid fa-clock"></i> ${d.item2}`;
      if (d.item3 && items[2]) items[2].innerHTML = `<i class="fa-solid fa-wrench"></i> ${d.item3}`;
      
      if (d.badge) document.querySelector(".slogan-badge").innerText = d.badge;
    }
  } catch (err) {
    console.error("Error al cargar eslogan:", err);
  }
}
cargarSloganDinamico();