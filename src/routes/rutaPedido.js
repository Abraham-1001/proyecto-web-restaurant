const express = require('express')
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/', pedidoController.CrearPedido)
    .get('/', pedidoController.ObtenerPedidos)
    .get('/:key/:value', pedidoController.ConsultarPedido)
    .delete('/:key/:value', pedidoController.EliminarPedido)
    .put('/:key/:value', pedidoController.ModificarPedido)

module.exports = router;