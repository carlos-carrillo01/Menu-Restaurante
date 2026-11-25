var carrito = [];
var folioPedido = null; // folio que regresa PHP


function renderizarMenu() {
    var ulAlimentos = document.getElementById("lista-alimentos");
    if (ulAlimentos) {
        ulAlimentos.innerHTML = "";

        for (var i = 0; i < alimentos.length; i++) {
            var item = alimentos[i];
            ulAlimentos.innerHTML += '<li>' +
                '<img src="' + item.imagen + '" class="img-menu" alt="' + item.nombre + '">' +
                '<div class="info-producto">' +
                    '<span class="nombre-producto">' + item.nombre + '</span><br>' +
                    '<span class="precio-producto">$' + item.precio + '</span>' +
                '</div>' +
                '<button class="btn-agregar" onclick="agregarAlTicket(\'alimentos\', ' + i + ')">+</button>' +
            '</li>';
        }
    }

    var ulBebidas = document.getElementById("lista-bebidas");
    if (ulBebidas) {
        ulBebidas.innerHTML = "";

        for (var j = 0; j < bebidas.length; j++) {
            var itemBebida = bebidas[j];
            ulBebidas.innerHTML += '<li>' +
                '<img src="' + itemBebida.imagen + '" class="img-menu" alt="' + itemBebida.nombre + '">' +
                '<div class="info-producto">' +
                    '<span class="nombre-producto">' + itemBebida.nombre + '</span><br>' +
                    '<span class="precio-producto">$' + itemBebida.precio + '</span>' +
                '</div>' +
                '<button class="btn-agregar" onclick="agregarAlTicket(\'bebidas\', ' + j + ')">+</button>' +
            '</li>';
        }
    }
}


function renderizarTicket() {
    var ulTicket = document.getElementById("detalle-ticket");
    var txtTotal = document.getElementById("total-precio");
    if (!ulTicket || !txtTotal) return;

    var total = 0;
    ulTicket.innerHTML = "";

    if (carrito.length === 0) {
        ulTicket.innerHTML = '<li><i>No hay artículos seleccionados</i></li>';
    } else {
        for (var i = 0; i < carrito.length; i++) {
            var item = carrito[i];
            ulTicket.innerHTML += '<li>' +
                '<span>' + item.nombre + '</span>' +
                '<span>$' + item.precio + '</span>' +
            '</li>';
            total += item.precio;
        }
    }

    txtTotal.innerText = total.toFixed(2);
}

function agregarAlTicket(tipo, index) {
    var productoSeleccionado;
    if (tipo === 'alimentos') {
        productoSeleccionado = alimentos[index];
    } else {
        productoSeleccionado = bebidas[index];
    }
    carrito.push(productoSeleccionado);
    renderizarTicket();
}

function limpiarTicket() {
    carrito = [];
    renderizarTicket();
}


// --- PAGO SIMULADO, ENVÍO JSON E IMPRESION ---

// 1. Funciones para manejar los Modales
function abrirModalPago() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Añade productos antes de pagar.");
        return;
    }
    var totalActual = document.getElementById("total-precio").innerText;
    document.getElementById("total-modal-pago").innerText = totalActual;
    document.getElementById("modal-pago").style.display = "block";
}

function cerrarModalPago() {
    document.getElementById("modal-pago").style.display = "none";
    var status = document.getElementById("pago-status");
    status.style.display = "none";
    status.innerText = "";
}

function abrirModalConfirmacion() {
    cerrarModalPago();
    document.getElementById("modal-confirmacion").style.display = "block";
}

function cerrarModalConfirmacion() {
    document.getElementById("modal-confirmacion").style.display = "none";
}

// 2. Simulación del Proceso de Pago
function procesarSimulacionPago() {
    var status = document.getElementById("pago-status");
    status.style.display = "block";
    status.innerText = "Conectando con el banco... Por favor, espere.";
    status.className = "pago-error";

    setTimeout(function() {
        status.innerText = "Autorizando transacción...";

        // Simular éxito/rechazo aleatorio (80% de éxito)
        var exito = Math.random() < 0.8;

        if (exito) {
            status.innerText = "¡Pago Autorizado con éxito!";
            status.className = "pago-exito";
            // Enviar el pedido en formato JSON a PHP
            setTimeout(enviarPedido, 1000);
        } else {
            status.innerText = "Error: Transacción Rechazada. Fondos insuficientes o tarjeta inválida. Intente de nuevo.";
            status.className = "pago-error";
        }

    }, 2000);
}

// 3. Armar el JSON, enviarlo a PHP y procesar la respuesta
// 3. Armar el JSON, enviarlo a PHP y procesar la respuesta
function enviarPedido() {
    var status = document.getElementById("pago-status");

    // Armar la lista de productos
    var productos = [];
    for (var i = 0; i < carrito.length; i++) {
        productos.push({
            nombre: carrito[i].nombre,
            precio: carrito[i].precio
        });
    }

    // Objeto que se convertirá en JSON
    var pedido = {
        cliente: {
            nombre:    document.getElementById("cliente-nombre").value,
            telefono:  document.getElementById("cliente-telefono").value,
            direccion: document.getElementById("cliente-direccion").value
        },
        pago: {
            titular: document.getElementById("tarjeta-nombre").value,
            numero:  document.getElementById("tarjeta-numero").value,
            vence:   document.getElementById("tarjeta-vence").value,
            cvv:     document.getElementById("tarjeta-cvv").value
        },
        productos: productos,
        total: parseFloat(document.getElementById("total-precio").innerText)
    };

    // Enviar como JSON por POST
    fetch("../php/parametros.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(data) {
        console.log("Respuesta de PHP:", data);

        if (data.ok) {
            folioPedido = data.folio;

            document.getElementById("datos-recibidos").innerHTML =
                "<b>Datos recibidos por PHP:</b><br>" +
                "Nombre: "    + data.cliente.nombre    + "<br>" +
                "Teléfono: "  + data.cliente.telefono  + "<br>" +
                "Dirección: " + data.cliente.direccion + "<br>" +
                "Titular: "   + data.pago.titular      + "<br>" +
                "Tarjeta: "   + data.pago.numero       + "<br>" +
                "Vence: "     + data.pago.vence        + "<br>" +
                "CVV: "       + data.pago.cvv          + "<br>" +
                "Total: $"    + data.total;

            abrirModalConfirmacion();
        } else {
            status.innerText = "Error: " + data.mensaje;
            status.className = "pago-error";
        }
    })
    .catch(function(error) {
        status.innerText = "No se pudo conectar con el servidor.";
        status.className = "pago-error";
        console.error(error);
    });
}

// 4. Generación del Ticket HTML y Impresión
function imprimirTicket() {
    var ticketImprimible = document.getElementById("ticket-imprimible");
    if (!ticketImprimible) return;

    var clienteNombre = document.getElementById("cliente-nombre").value;
    var clienteTelefono = document.getElementById("cliente-telefono").value;
    var clienteDireccion = document.getElementById("cliente-direccion").value;

    var total = 0;
    var lineasProductos = "";
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        lineasProductos += '<div class="linea-ticket">' +
            '<span>' + item.nombre + '</span>' +
            '<span>$' + item.precio.toFixed(2) + '</span>' +
        '</div>';
        total += item.precio;
    }

    var htmlTicket = '<h2>RESTAURANTE EL INGE</h2>' +
        '<p style="text-align:center; font-size: 0.8em; margin: 0;">Sabor Auténtico, lo mejor de Zacatecas</p>' +
        '<p style="text-align:center; font-size: 0.8em; margin: 5px 0;">Ticket No: ' + folioPedido + '</p>' +
        '<hr style="border: 1px dashed black; margin: 10px 0;">' +

        '<h3>DATOS CLIENTE:</h3>' +
        '<p><strong>Nombre:</strong> ' + clienteNombre + '</p>' +
        '<p><strong>Teléfono:</strong> ' + clienteTelefono + '</p>' +
        '<p><strong>Dirección:</strong> ' + clienteDireccion + '</p>' +

        '<hr style="border: 1px dashed black; margin: 10px 0;">' +

        '<h3>DETALLE PEDIDO:</h3>' +
        lineasProductos +

        '<div class="total-final">TOTAL A PAGAR: $' + total.toFixed(2) + '</div>' +

        '<hr style="border: 1px dashed black; margin: 10px 0;">' +
        '<p style="text-align:center; margin-top: 15px;">¡Gracias por tu preferencia!</p>' +
        '<p style="text-align:center; font-size: 0.8em;">Impreso desde la Web - Demo Inge</p>';

    ticketImprimible.innerHTML = htmlTicket;
    ticketImprimible.style.display = "block";

    window.print();

    // Limpiar todo después de imprimir
    limpiarTicket();
    document.getElementById("form-pago").reset();
    cerrarModalConfirmacion();
    ticketImprimible.style.display = "none";
}

// Cerrar modales si el usuario hace clic fuera
window.onclick = function(event) {
    var modalPago = document.getElementById("modal-pago");
    var modalConfirmacion = document.getElementById("modal-confirmacion");
    if (event.target == modalPago) {
        cerrarModalPago();
    }
    if (event.target == modalConfirmacion) {
        cerrarModalConfirmacion();
    }
}

// Interceptar el submit: validar, simular pago y luego enviar JSON
document.getElementById("form-pago").addEventListener("submit", function(e) {
    e.preventDefault();
    procesarSimulacionPago();
});

// --- INICIALIZACIÓN ---
renderizarMenu();
renderizarTicket();