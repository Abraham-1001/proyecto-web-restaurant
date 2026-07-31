const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: false,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'correo electrónico no valido.']
  },
  password: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    trim: true
  },
  rol: {
    type: String,
    enum: ['ADMIN', 'MESERO', 'CAJERO'],
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