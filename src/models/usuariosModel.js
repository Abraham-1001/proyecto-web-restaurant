const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  contrasena: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: false
  },
  rol: {
    type: String,
    enum: ['Administrador', 'Mesero', 'Cajero'],
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

const usuarioModel = mongoose.model('Usuario', usuarioSchema);

module.exports = usuarioModel;