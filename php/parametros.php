<?php
header('Content-Type: application/json; charset=utf-8');

$json  = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!$datos || !isset($datos['cliente'], $datos['pago'], $datos['productos'])) {
    http_response_code(400);
    echo json_encode([
        "ok"      => false,
        "mensaje" => "Datos incompletos o JSON inválido"
    ]);
    exit;
}

$productos = $datos['productos'];

// Recalcular el total en el servidor
$total = 0;
foreach ($productos as $p) {
    $total += $p['precio'];
}

// Responder con JSON (incluye cliente y pago)
echo json_encode([
    "ok"        => true,
    "mensaje"   => "Pedido recibido correctamente",
    "folio"     => rand(1000, 9999),
    "cliente"   => [
        "nombre"    => $datos['cliente']['nombre'],
        "telefono"  => $datos['cliente']['telefono'],
        "direccion" => $datos['cliente']['direccion']
    ],
    "pago"      => [
        "titular" => $datos['pago']['titular'],
        "numero"  => $datos['pago']['numero'],
        "vence"   => $datos['pago']['vence'],
        "cvv"     => $datos['pago']['cvv']
    ],
    "articulos" => count($productos),
    "total"     => $total
]);
?>