const express = require('express')
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', categoriaController.ObtenerCategorias)
    .get('/:key/:value', categoriaController.ConsultarCategoria)
    .post('/', authorizeRoles('ADMIN'), categoriaController.CrearCategoria)
    .delete('/:key/:value', authorizeRoles('ADMIN'), categoriaController.EliminarCategoria)
    .put('/:key/:value', authorizeRoles('ADMIN'), categoriaController.ModificarCategoria)

module.exports = router;