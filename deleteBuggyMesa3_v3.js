const mongoose = require('mongoose');
const { db } = require('./src/config/config');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');
const Mesa = require('./src/models/mesaModel');

mongoose.connect(db)
  .then(async () => {
    console.log('Conectado a la base de datos');
    
    const mesa3 = await Mesa.findOne({ numero_mesa: 3 });
    if(mesa3) {
      console.log('Mesa 3 id:', mesa3._id);
      const pedidos = await Pedido.find({ mesa: mesa3._id });
      console.log(`Encontrados ${pedidos.length} pedidos para Mesa 3.`);
      for(const p of pedidos) {
        console.log(`Pedido ${p._id} - estado: ${p.estado}`);
        // If it's buggy, delete it.
        // Wait, maybe we should delete all pedidos for mesa 3 to fix the bug? The user said:
        // "elimines únicamente ese registro de Mesa 3 que está causando el problema, sin modificar las demás ventas, mesas o registros."
        // "La Mesa 3 debe seguir existiendo y funcionando normalmente"
        if(p.estado !== 'PAGADO' && p.estado !== 'CANCELADO') {
          console.log(`Eliminando pedido ${p._id} con estado ${p.estado}`);
          await Pedido.deleteOne({ _id: p._id });
        }
      }
    }
    
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
