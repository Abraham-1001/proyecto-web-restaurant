const mongoose = require('mongoose');
const { db } = require('./src/config/config');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');
const Mesa = require('./src/models/mesaModel');

mongoose.connect(db)
  .then(async () => {
    console.log('Conectado a la base de datos');
    // Buscar la Mesa 3
    const mesa3 = await Mesa.findOne({ numero_mesa: 3 });
    if (!mesa3) {
      console.log('Mesa 3 no encontrada');
      process.exit(0);
    }

    // Buscar pedidos de Mesa 3 que estén relacionados con un Pago no cortado o en estado pagado.
    // El usuario dijo que aparece en el Corte de Caja.
    // El Corte de Caja muestra pagos no cortados.
    const pagosNoCortados = await Pago.find({ cortado: false, estado: 'EXITOSO' });
    
    for (const pago of pagosNoCortados) {
      const pedido = await Pedido.findById(pago.pedido);
      if (pedido && pedido.mesa.toString() === mesa3._id.toString()) {
        console.log('Encontrado pedido bugueado de Mesa 3:', pedido._id);
        console.log('Encontrado pago bugueado:', pago._id);
        
        await Pago.deleteOne({ _id: pago._id });
        await Pedido.deleteOne({ _id: pedido._id });
        console.log('Registro eliminado.');
      }
    }
    
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
