const mongoose = require('mongoose');
const { db } = require('./src/config/config');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');
const Mesa = require('./src/models/mesaModel');

mongoose.connect(db)
  .then(async () => {
    console.log('Conectado a la base de datos');
    const pagosNoCortados = await Pago.find({ cortado: false, estado: 'EXITOSO' });
    console.log(`Encontrados ${pagosNoCortados.length} pagos no cortados.`);
    
    for (const pago of pagosNoCortados) {
      const pedido = await Pedido.findById(pago.pedido);
      if (pedido) {
        const mesa = await Mesa.findById(pedido.mesa);
        console.log(`Pago ${pago._id} - Pedido ${pedido._id} - Mesa ${mesa ? mesa.numero_mesa : 'N/A'}`);
        if (mesa && mesa.numero_mesa === 3) {
          console.log('¡Mesa 3 encontrada! Eliminando pago y pedido...');
          await Pago.deleteOne({ _id: pago._id });
          await Pedido.deleteOne({ _id: pedido._id });
        }
      } else {
        console.log(`Pago ${pago._id} no tiene pedido asociado.`);
      }
    }
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
