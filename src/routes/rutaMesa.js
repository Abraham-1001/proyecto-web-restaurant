const express = require('express')
const router = express.Router();
const mesaController = require('../controllers/mesaController');

router.post('/', mesaController.CrearMesa)
    .get('/', mesaController.ObtenerMesas)
    .get('/:key/:value', mesaController.ConsultarMesa)
    .delete('/:key/:value', mesaController.EliminarMesa)
    .put('/:key/:value', mesaController.ModificarMesa)

module.exports = router;