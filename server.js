const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "pedidos.json");

const ESTADOS_VALIDOS = ["Pendiente", "En preparación", "Listo", "Entregado", "Cancelado"];
const ESTADOS_ACTIVOS = ["Pendiente", "En preparación", "Listo"];

app.use(express.json());

function leerPedidos() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, "utf8");
  if (!data.trim()) {
    return [];
  }
  return JSON.parse(data);
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(pedidos, null, 2), "utf8");
}

function validarPedido(datos, parcial = false) {
  const errores = [];

  if (!parcial || datos.cliente !== undefined) {
    if (typeof datos.cliente !== "string" || !datos.cliente.trim()) {
      errores.push("El campo 'cliente' es obligatorio y no puede estar vacío.");
    }
  }

  if (!parcial || datos.producto !== undefined) {
    if (typeof datos.producto !== "string" || !datos.producto.trim()) {
      errores.push("El campo 'producto' es obligatorio y no puede estar vacío.");
    }
  }

  if (!parcial || datos.cantidad !== undefined) {
    if (datos.cantidad == null) {
      errores.push("El campo 'cantidad' es obligatorio.");
    } else if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
      errores.push("La 'cantidad' debe ser un número entero mayor que 0.");
    }
  }

  if (datos.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(datos.estado)) {
      errores.push(`El 'estado' debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}.`);
    }
  }

  return errores;
}

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.status(200).json({
    mensaje: "API de Pedidos - MVP (Sesión 11)",
    endpoints: [
      "GET /api/pedidos",
      "GET /api/pedidos/activos",
      "GET /api/pedidos/:id",
      "POST /api/pedidos",
      "PATCH /api/pedidos/:id",
      "DELETE /api/pedidos/:id"
    ]
  });
});

// GET - listar todos
app.get("/api/pedidos", (req, res) => {
  try {
    const pedidos = leerPedidos();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer los pedidos", detalle: error.message });
  }
});

// GET - pedidos activos (HU-04)
app.get("/api/pedidos/activos", (req, res) => {
  try {
    const pedidos = leerPedidos();
    const activos = pedidos.filter(p => ESTADOS_ACTIVOS.includes(p.estado));
    res.status(200).json(activos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer los pedidos activos", detalle: error.message });
  }
});

// GET - buscar por ID
app.get("/api/pedidos/:id", (req, res) => {
  try {
    const pedidos = leerPedidos();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ mensaje: "El ID debe ser un número válido." });
    }
    const pedido = pedidos.find(p => p.id === id);

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar el pedido", detalle: error.message });
  }
});

// POST - crear
app.post("/api/pedidos", (req, res) => {
  try {
    const { cliente, producto, cantidad, estado } = req.body || {};

    const errores = validarPedido({ cliente, producto, cantidad, estado });
    if (errores.length) {
      return res.status(400).json({ mensaje: "Datos inválidos", errores });
    }

    const pedidos = leerPedidos();
    const nuevoId = pedidos.length ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;

    const nuevoPedido = {
      id: nuevoId,
      cliente: cliente.trim(),
      producto: producto.trim(),
      cantidad,
      estado: estado || "Pendiente"
    };

    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);

    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el pedido", detalle: error.message });
  }
});

// PATCH - actualizar parcialmente
app.patch("/api/pedidos/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ mensaje: "El ID debe ser un número válido." });
    }

    const pedidos = leerPedidos();
    const index = pedidos.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    const cambios = { ...req.body };
    delete cambios.id;

    const errores = validarPedido(cambios, true);
    if (errores.length) {
      return res.status(400).json({ mensaje: "Datos inválidos", errores });
    }

    if (cambios.cliente) cambios.cliente = cambios.cliente.trim();
    if (cambios.producto) cambios.producto = cambios.producto.trim();

    pedidos[index] = {
      ...pedidos[index],
      ...cambios
    };

    guardarPedidos(pedidos);
    res.status(200).json(pedidos[index]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el pedido", detalle: error.message });
  }
});

// DELETE - eliminar
app.delete("/api/pedidos/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ mensaje: "El ID debe ser un número válido." });
    }

    const pedidos = leerPedidos();
    const index = pedidos.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    const eliminado = pedidos.splice(index, 1)[0];
    guardarPedidos(pedidos);

    res.status(200).json({
      mensaje: "Pedido eliminado correctamente",
      pedido: eliminado
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el pedido", detalle: error.message });
  }
});

// Manejo simple de ruta no existente
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

// Manejo de errores no controlados
app.use((err, req, res, next) => {
  res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
});

app.listen(PORT, () => {
  console.log(`API ejecutándose en http://localhost:${PORT}`);
});