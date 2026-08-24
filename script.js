import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

cargarInfoEnviosTienda();

// --- LEER ESLOGAN Y PRESENTACIÓN DINÁMICA ---
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

// =========================================================================
// --- FUNCIÓN DE ENVIAR PEDIDO POR WHATSAPP Y GUARDAR EN FIRESTORE ---
// =========================================================================
window.enviarPedidoWhatsApp = async function() {
  try {
    // 1. Obtener los productos del carrito (asumiendo que los guardas en localStorage o cambialo según tu lógica)
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // 2. Obtener los datos ingresados por el cliente en el formulario de compra
    const nombreCliente = document.getElementById('nombre-cliente')?.value || 'Cliente Web';
    const telefonoCliente = document.getElementById('telefono-cliente')?.value || 'No especificado';
    const direccionCliente = document.getElementById('direccion-cliente')?.value || 'No especificada';
    const notasCliente = document.getElementById('notas-cliente')?.value || '';
    const metodoPago = document.getElementById('metodo-pago')?.value || 'Efectivo';

    // 3. Calcular el total del pedido
    let total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // 4. Generar un número de orden único
    const numeroOrden = 'PEQ-' + Math.floor(100000 + Math.random() * 900000);

    // 5. Estructurar el objeto que se guardará en la base de datos (Colección: "pedidos")
    const nuevoPedido = {
      numeroOrden: numeroOrden,
      cliente: {
        nombre: nombreCliente,
        telefono: telefonoCliente,
        direccion: direccionCliente,
        notas: notasCliente,
        metodoPago: metodoPago
      },
      productos: carrito,
      total: total,
      estado: 'Pendiente', // Estado inicial para que lo vea tu panel admin
      createdAt: serverTimestamp()
    };

    // 6. Guardar en Firestore
    await addDoc(collection(db, "pedidos"), nuevoPedido);
    console.log("¡Pedido registrado con éxito en Firestore!");

    // 7. Armar el mensaje de texto para WhatsApp
    let mensaje = `*¡Nuevo Pedido - Peque Elektro!* 🛒\n`;
    mensaje += `*Nro de Orden:* ${numeroOrden}\n\n`;
    mensaje += `*Cliente:* ${nombreCliente}\n`;
    mensaje += `*Teléfono:* ${telefonoCliente}\n`;
    mensaje += `*Dirección:* ${direccionCliente}\n`;
    mensaje += `*Método de Pago:* ${metodoPago}\n\n`;
    mensaje += `*Detalle de Productos:*\n`;

    carrito.forEach(item => {
      mensaje += `- ${item.nombre} (x${item.cantidad}) - $${item.precio * item.cantidad}\n`;
    });

    mensaje += `\n*Total a Pagar:* $${total}`;
    if (notasCliente) {
      mensaje += `\n*Notas:* ${notasCliente}`;
    }

    // 8. Reemplaza este número por el de tu local (con código de país y área, sin signos ni espacios, ej: 54911XXXXXXXX)
    const numeroWhatsAppNegocio = "5491100000000"; 
    const urlWhatsApp = `https://wa.me/${numeroWhatsAppNegocio}?text=${encodeURIComponent(mensaje)}`;

    // 9. Limpiar carrito opcionalmente y abrir WhatsApp
    // localStorage.removeItem('carrito'); 
    window.open(urlWhatsApp, '_blank');

  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    alert("Hubo un error al registrar el pedido en el sistema. Por favor, intenta de nuevo.");
  }
};