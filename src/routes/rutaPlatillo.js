const express = require('express')
const router = express.Router();
const platilloController = require('../controllers/platilloController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', platilloController.ObtenerPlatillos)
    .get('/:key/:value', platilloController.ConsultarPlatillo)
    .post('/', authorizeRoles('ADMIN'), platilloController.CrearPlatillo)
    .delete('/:key/:value', authorizeRoles('ADMIN'), platilloController.EliminarPlatillo)
    .put('/:key/:value', authorizeRoles('ADMIN'), platilloController.ModificarPlatillo)

module.exports = router;