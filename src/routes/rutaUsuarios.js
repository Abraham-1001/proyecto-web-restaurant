const express = require('express')
const router = express.Router();
const usuarioController = require('../controllers/usuariosController');

router.post('/', usuarioController.CrearUsuario)
    .get('/', usuarioController.ObtenerUsuarios)
    .get('/:key/:value', usuarioController.ConsultarUsuario)
    .delete('/:key/:value', usuarioController.EliminarUsuario)
    .put('/:key/:value', usuarioController.ModificarUsuario)

module.exports = router;