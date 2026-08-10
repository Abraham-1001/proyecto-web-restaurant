const express = require('express')
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', mesaController.ObtenerMesas)
    .get('/:key/:value', mesaController.ConsultarMesa)
    .post('/', authorizeRoles('ADMIN'), mesaController.CrearMesa)
    .delete('/:key/:value', authorizeRoles('ADMIN'), mesaController.EliminarMesa)
    .put('/:key/:value', authorizeRoles('ADMIN'), mesaController.ModificarMesa)

module.exports = router;