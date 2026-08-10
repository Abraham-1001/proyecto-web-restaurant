const express = require('express')
const router = express.Router();
const usuarioController = require('../controllers/usuariosController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.post('/login', usuarioController.loginUsuario);

router.use(authenticate, authorizeRoles('ADMIN'));

router.post('/', usuarioController.CrearUsuario)
    .get('/', usuarioController.ObtenerUsuarios)
    .get('/:key/:value', usuarioController.ConsultarUsuario)
    .delete('/:key/:value', usuarioController.EliminarUsuario)
    .put('/:key/:value', usuarioController.ModificarUsuario)

module.exports = router;