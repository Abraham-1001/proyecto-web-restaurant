const mongoose = require('mongoose');
const { db } = require('./src/config/config');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');

mongoose.connect(db)
  .then(async () => {
    console.log('Conectado a la base de datos');
    const resultPago = await Pago.deleteOne({ _id: '6a76626b4623141e2edc495c' });
    const resultPedido = await Pedido.deleteOne({ _id: '6a7662524623141e2edc4955' });
    console.log('Pago eliminado:', resultPago);
    console.log('Pedido eliminado:', resultPedido);
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
