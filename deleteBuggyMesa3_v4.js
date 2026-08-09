const mongoose = require('mongoose');
const { db } = require('./src/config/config');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');
const Mesa = require('./src/models/mesaModel');

mongoose.connect(db)
  .then(async () => {
    console.log('Conectado a la base de datos');
    const pago = await Pago.findOne({ pedido: '6a7662524623141e2edc4955' });
    console.log(pago);
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
