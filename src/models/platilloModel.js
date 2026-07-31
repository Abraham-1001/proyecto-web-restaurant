const mongoose = require('mongoose');

const platilloSchema = new mongoose.Schema({
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  imagen: {
    type: String,
    required: false
  },
  disponible: {
    type: Boolean,
    default: true
  }
});

const platilloModel = mongoose.model('Platillo', platilloSchema);

module.exports = platilloModel; 