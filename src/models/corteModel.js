const mongoose = require('mongoose');

const corteSchema = new mongoose.Schema({
  fecha_corte: {
    type: Date,
    default: Date.now
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  total_recaudado: {
    type: Number,
    required: true,
    default: 0
  },
  cantidad_ventas: {
    type: Number,
    required: true,
    default: 0
  },
  desglose: {
    EFECTIVO: { type: Number, default: 0 },
    TARJETA: { type: Number, default: 0 },
    TRANSFERENCIA: { type: Number, default: 0 }
  },
  ventas_incluidas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago'
  }]
});

const corteModel = mongoose.model('Corte', corteSchema);

module.exports = corteModel;
