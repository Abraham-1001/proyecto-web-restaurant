const mongoose = require('mongoose');

const detallePedidoSchema = new mongoose.Schema({
  platillo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Platillo',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const pedidoSchema = new mongoose.Schema({
  mesero: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  mesa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mesa',
    required: true
  },
  detalles: [detallePedidoSchema],
  fecha: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'EN_PREPARACION', 'SERVIDO', 'PAGADO', 'CANCELADO'],
    default: 'PENDIENTE'
  },
  total: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

const pedidoModel = mongoose.model('Pedido', pedidoSchema);

module.exports = pedidoModel;