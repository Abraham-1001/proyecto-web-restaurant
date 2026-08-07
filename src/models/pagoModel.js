const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true,
    unique: true
  },
  metodo_pago: {
    type: String,
    enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'],
    required: true
  },
  monto: {
    type: Number,
    required: true,
    min: 1
  },
  fecha_pago: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['EXITOSO', 'RECHAZADO'],
    default: 'EXITOSO'
  },
  cortado: {
    type: Boolean,
    default: false
  },
  corte_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Corte',
    required: false
  }
});

const pagoModel = mongoose.model('Pago', pagoSchema);

module.exports = pagoModel;