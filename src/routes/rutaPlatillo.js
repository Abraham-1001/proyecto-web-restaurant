const express = require('express')
const router = express.Router();
const platilloController = require('../controllers/platilloController');

router.post('/', platilloController.CrearPlatillo)
    .get('/', platilloController.ObtenerPlatillos)
    .get('/:key/:value', platilloController.ConsultarPlatillo)
    .delete('/:key/:value', platilloController.EliminarPlatillo)
    .put('/:key/:value', platilloController.ModificarPlatillo)

module.exports = router;