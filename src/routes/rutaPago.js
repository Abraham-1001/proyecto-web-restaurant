const express = require('express')
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('CAJERO', 'ADMIN'));

router.post('/', pagoController.CrearPago)
    .get('/', pagoController.ObtenerPagos)
    .get('/:key/:value', pagoController.ConsultarPago)
    .delete('/:key/:value', pagoController.EliminarPago)
    .put('/:key/:value', pagoController.ModificarPago)

module.exports = router;