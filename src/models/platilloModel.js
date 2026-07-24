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
    unique: true
  },
  descripcion: {
    type: String,
    required: false
  },
  precio: {
    type: Number,
    required: true
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