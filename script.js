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

// --- CARGAR INFORMACIÓN DE ENVÍOS DESDE FIREBASE ---
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
        console.error("Error al cargar envíos:", error);
    }
}
cargarInfoEnviosTienda();

// --- CARGAR ESLOGAN DESDE FIREBASE ---
async function cargarSloganDinamico() {
    try {
        const snap = await getDoc(doc(db, "configuracion", "slogan"));
        if (snap.exists()) {
            const d = snap.data();
            if (d.titulo) document.querySelector(".slogan-container h2").innerText = d.titulo;
            if (d.intro) document.querySelector(".slogan-intro").innerText = d.intro;
            
            const items = document.querySelectorAll(".slogan-list li");
            if (d.item1 && items[0]) items[0].innerHTML = `<i class="fa-solid fa-check"></i> ${d.item1}`;
            if (d.item2 && items[1]) items[1].innerHTML = `<i class="fa-solid fa-check"></i> ${d.item2}`;
            if (d.item3 && items[2]) items[2].innerHTML = `<i class="fa-solid fa-check"></i> ${d.item3}`;
            
            if (d.badge) document.querySelector(".slogan-badge").innerText = d.badge;
        }
    } catch (err) {
        console.error("Error al cargar eslogan:", err);
    }
}
cargarSloganDinamico();

// =========================================================================
// --- ENVIAR PEDIDO POR WHATSAPP Y GUARDAR EN FIRESTORE ---
// =========================================================================
window.enviarPedidoWhatsApp = async function() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        if (carrito.length === 0) {
            alert("⚠️ Tu carrito está vacío. Agrega productos primero.");
            return;
        }

        // Pedir datos al cliente (puedes agregar un formulario HTML si prefieres)
        const nombreCliente = prompt("📝 Ingresa tu nombre:") || "Cliente Web";
        const telefonoCliente = prompt("📱 Ingresa tu teléfono:") || "No especificado";
        const direccionCliente = prompt("📍 Ingresa tu dirección o zona de entrega:") || "No especificada";
        const notasCliente = prompt("✏️ ¿Alguna nota adicional? (opcional):") || "";

        // Calcular total
        let total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        // Generar número de orden
        const numeroOrden = 'PEQ-' + Math.floor(100000 + Math.random() * 900000);

        // Guardar en Firestore (ESTRUCTURA ÚNICA que el admin lee perfectamente)
        const nuevoPedido = {
            orden: numeroOrden,
            numeroOrden: numeroOrden,
            cliente: {
                nombre: nombreCliente,
                telefono: telefonoCliente,
                direccion: direccionCliente,
                notas: notasCliente,
                metodoPago: "Efectivo"
            },
            items: carrito,
            productos: carrito,
            total: total,
            estado: 'Pendiente',
            fecha: serverTimestamp(),
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "pedidos"), nuevoPedido);
        console.log("✅ Pedido guardado en Firestore");

        // Armar mensaje de WhatsApp
        let mensaje = `*¡Nuevo Pedido - Peque Elektro!* 🛒\n`;
        mensaje += `*Nro de Orden:* ${numeroOrden}\n\n`;
        mensaje += `*Cliente:* ${nombreCliente}\n`;
        mensaje += `*Teléfono:* ${telefonoCliente}\n`;
        mensaje += `*Dirección:* ${direccionCliente}\n\n`;
        mensaje += `*Detalle de Productos:*\n`;
        carrito.forEach(item => {
            mensaje += `- ${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n`;
        });
        mensaje += `\n*Total a Pagar:* $${total.toLocaleString('es-AR')}`;
        if (notasCliente) mensaje += `\n*Notas:* ${notasCliente}`;

        // Tu número de WhatsApp (cámbialo si es necesario)
        const numeroWhatsApp = "5491134970171"; 
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        // Limpiar carrito y abrir WhatsApp
        localStorage.removeItem('carrito');
        window.open(url, '_blank');
        alert("✅ ¡Pedido enviado! Se abrirá WhatsApp para continuar.");
        location.reload();

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Hubo un error. Intenta de nuevo.");
    }
};