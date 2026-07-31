const bcrypt = require('bcrypt');
const modeloUsuario = require('../models/usuariosModel');

async function CrearUsuario(req, res) {
    try {
        const usuario = await modeloUsuario.findOne({ correo: req.body.correo });
        if (usuario) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }
        const passCifrada = await bcrypt.hash(req.body.contrasena, 10);
        req.body.contrasena = passCifrada;
        const nuevoUsuario = new modeloUsuario(req.body);
        return res.status(201).json({ message: 'Usuario creado correctamente', nuevoUsuario });
    } 
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

 function ObtenerUsuarios(req, res) {
    modeloUsuario.find()
        .then((usuarios) => {
            if(usuarios.length === 0) {
                return res.status(200).json({ message: 'No se encontraron usuarios' });
            }
            res.status(200).json(usuarios);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarUsuario(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    console.log(consulta);
    modeloUsuario.findOne(consulta)
        .then((usuario) => {
            if(!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json({ message: 'Consulta realizada correctamente', usuario });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function EliminarUsuario(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloUsuario.findOneAndDelete(consulta)
        .then((usuario) => {
            if(!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json({ message: 'Usuario eliminado correctamente'});
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

async function ModificarUsuario(req, res) {
    try {
        const consulta = {}
        consulta[req.params.key] = req.params.value;
        if(req.body.contrasena) {
            req.body.contrasena = await bcrypt.hash(req.body.contrasena, 10);
        }
        const usuario = await modeloUsuario.findOneAndUpdate(consulta, req.body, {new: true});
        if(!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ message: 'Usuario modificado correctamente', usuario });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = {
    CrearUsuario,
    ObtenerUsuarios,
    ConsultarUsuario,
    EliminarUsuario,
    ModificarUsuario
}