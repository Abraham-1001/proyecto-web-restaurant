const express = require('express')
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.post('/', categoriaController.CrearCategoria)
    .get('/', categoriaController.ObtenerCategorias)
    .get('/:key/:value', categoriaController.ConsultarCategoria)
    .delete('/:key/:value', categoriaController.EliminarCategoria)
    .put('/:key/:value', categoriaController.ModificarCategoria)

module.exports = router;