const mongoose = require('mongoose');

const mesaSchema = new mongoose.Schema({
  numero_mesa: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  capacidad: {
    type: Number,
    required: true,
    min: 1
  },
  estado: {
    type: String,
    enum: ['LIBRE', 'OCUPADA', 'RESERVADA'],
    default: 'LIBRE'
  }
});

const mesaModel = mongoose.model('Mesa', mesaSchema);

module.exports = mesaModel;