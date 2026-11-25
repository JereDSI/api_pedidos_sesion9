# Registro de Incidencias

| # | Problema encontrado | Prioridad | Solución aplicada | Estado |
|---|---|---|---|---|
| 1 | Pedidos con campos vacíos se registraban | Alta | Validación de cliente/producto no vacíos | Resuelto |
| 2 | Cantidades inválidas (0, negativas, texto) se aceptaban | Alta | Validación de entero > 0 | Resuelto |
| 3 | Estado inválido se guardaba | Media | Lista de estados válidos | Resuelto |
| 4 | Error al leer archivo si no existe | Media | leerPedidos verifica existencia | Resuelto |
| 5 | PATCH permitía modificar el id | Media | Se elimina id de los cambios | Resuelto |
| 6 | Sin manejo de errores 500 | Media | try/catch en todos los endpoints | Resuelto |
| 7 | No existía endpoint de pedidos activos | Baja | GET /api/pedidos/activos | Resuelto |