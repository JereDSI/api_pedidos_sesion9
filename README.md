# API de Pedidos - MVP (Sesión 11)

API REST de pedidos construida con Node.js y Express. Persiste los datos en `data/pedidos.json`.

## Requisitos
- Node.js instalado
- Postman instalado

## Instalación
1. Abrir una terminal dentro de esta carpeta.
2. Ejecutar:
```bash
npm install
```
3. Iniciar la API:
```bash
npm start
```
4. La API queda disponible en:
```text
http://localhost:3000
```

## Endpoints

### GET - listar pedidos
```
GET http://localhost:3000/api/pedidos
```

### GET - pedidos activos (HU-04)
```
GET http://localhost:3000/api/pedidos/activos
```

### GET - obtener un pedido
```
GET http://localhost:3000/api/pedidos/1
```

### POST - crear pedido
```
POST http://localhost:3000/api/pedidos
```
Body JSON:
```json
{
  "cliente": "Katerine",
  "producto": "Pizza mediana",
  "cantidad": 2,
  "estado": "Pendiente"
}
```

### PATCH - actualizar pedido
```
PATCH http://localhost:3000/api/pedidos/1
```
Body JSON:
```json
{
  "estado": "Listo"
}
```

### DELETE - eliminar pedido
```
DELETE http://localhost:3000/api/pedidos/1
```

## Estados válidos
Pendiente, En preparación, Listo, Entregado, Cancelado.

Los pedidos "activos" son aquellos cuyo estado es Pendiente, En preparación o Listo.

## Validaciones
- cliente y producto no pueden estar vacíos.
- cantidad debe ser un entero mayor que 0.
- estado, si se envía, debe ser válido.

## Códigos HTTP
200, 201, 400, 404, 500.

## Base de datos
Los datos se guardan en `data/pedidos.json` (persistencia en archivo).
