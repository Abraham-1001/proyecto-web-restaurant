const express = require('express')
const router = express.Router();
const pagoController = require('../controllers/pagoController');

router.post('/', pagoController.CrearPago)
    .get('/', pagoController.ObtenerPagos)
    .get('/:key/:value', pagoController.ConsultarPago)
    .delete('/:key/:value', pagoController.EliminarPago)
    .put('/:key/:value', pagoController.ModificarPago)

module.exports = router;