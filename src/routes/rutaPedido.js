const express = require('express')
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', pedidoController.ObtenerPedidos)
    .get('/:key/:value', pedidoController.ConsultarPedido)
    .post('/', authorizeRoles('MESERO', 'ADMIN'), pedidoController.CrearPedido)
    .delete('/:key/:value', authorizeRoles('MESERO', 'ADMIN'), pedidoController.EliminarPedido)
    .put('/:key/:value', authorizeRoles('MESERO', 'ADMIN'), pedidoController.ModificarPedido)

module.exports = router;