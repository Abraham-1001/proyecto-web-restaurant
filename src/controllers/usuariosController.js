const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const modeloUsuario = require('../models/usuariosModel');

async function CrearUsuario(req, res) {
    try {
        // 1. Validar que nos hayan enviado el password en el JSON
        if (!req.body.password) {
            return res.status(400).json({ message: 'El campo password es obligatorio' });
        }

        // 2. Verificar si el correo ya existe
        const usuario = await modeloUsuario.findOne({ correo: req.body.correo });
        if (usuario) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // 3. Cifrar la contraseña en texto plano (ahora es seguro porque ya validamos que existe)
        const passCifrada = await bcrypt.hash(req.body.password, 10);
        req.body.password = passCifrada;

        // 4. Guardar en MongoDB
        const nuevoUsuario = new modeloUsuario(req.body);
        await nuevoUsuario.save();

        // 5. Excluir el password cifrado de la respuesta por seguridad
        nuevoUsuario.password = undefined;

        return res.status(201).json({
            message: 'Usuario creado correctamente',
            usuario: nuevoUsuario
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

function ObtenerUsuarios(req, res) {
    modeloUsuario.find().select('-password')
        .then((usuarios) => {
            if (usuarios.length === 0) {
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
    modeloUsuario.findOne(consulta).select('-password')
        .then((usuario) => {
            if (!usuario) {
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
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

async function ModificarUsuario(req, res) {
    try {
        const consulta = {}
        consulta[req.params.key] = req.params.value;
        if (req.body.hasOwnProperty('password')) {
            if (!req.body.password) {
                return res.status(400).json({ message: 'El campo password no puede estar vacío' });
            }
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const usuario = await modeloUsuario.findOneAndUpdate(consulta, req.body, { returnDocument: 'after' });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ message: 'Usuario modificado correctamente', usuario });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function loginUsuario(req, res) {
    try {
        const { correo, password } = req.body;
        const usuario = await modeloUsuario.findOne({ correo });
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        if (!usuario.password) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { _id: usuario._id, correo: usuario.correo, rol: usuario.rol },
            process.env.JWT_SECRET || 'secreto_super_seguro_jwt',
            { expiresIn: '8h' }
        );

        return res.status(200).json({ mensaje: "Login exitoso", usuario, token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    CrearUsuario,
    ObtenerUsuarios,
    ConsultarUsuario,
    EliminarUsuario,
    ModificarUsuario,
    loginUsuario
}