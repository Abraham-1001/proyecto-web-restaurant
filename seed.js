const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { db } = require('./src/config/config');

const Usuario = require('./src/models/usuariosModel');
const Categoria = require('./src/models/categoriaModel');
const Platillo = require('./src/models/platilloModel');
const Mesa = require('./src/models/mesaModel');
const Pedido = require('./src/models/pedidoModel');
const Pago = require('./src/models/pagoModel');
const Corte = require('./src/models/corteModel');

const seedDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('✅ Conectado a MongoDB');

    // Limpiar las colecciones para no duplicar datos
    await Usuario.deleteMany({});
    await Categoria.deleteMany({});
    await Platillo.deleteMany({});
    await Mesa.deleteMany({});
    await Pedido.deleteMany({});
    await Pago.deleteMany({});
    await Corte.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // Crear Usuarios con contraseñas encriptadas
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const meseroPassword = await bcrypt.hash('mesero123', saltRounds);
    const cajeroPassword = await bcrypt.hash('cajero123', saltRounds);

    await Usuario.create([
      { nombre: 'Admin', correo: 'admin@pizzeria.com', password: adminPassword, rol: 'ADMIN' },
      { nombre: 'Mesero', correo: 'mesero@pizzeria.com', password: meseroPassword, rol: 'MESERO' },
      { nombre: 'Cajero', correo: 'cajero@pizzeria.com', password: cajeroPassword, rol: 'CAJERO' }
    ]);
    console.log('✅ Usuarios creados');

    // Crear Categorías
    const [catPizzas, catBebidas, catPostres] = await Categoria.create([
      { nombre: 'Pizzas', descripcion: 'Pizzas clásicas y especiales' },
      { nombre: 'Bebidas', descripcion: 'Refrescos, aguas y más' },
      { nombre: 'Postres', descripcion: 'Deliciosos postres' }
    ]);
    console.log('✅ Categorías creadas');

    // Crear Platillos de ejemplo
    await Platillo.create([
      { nombre: 'Pizza Pepperoni', descripcion: 'Deliciosa pizza de pepperoni con queso extra', precio: 250.00, categoria: catPizzas._id },
      { nombre: 'Coca Cola 1L', descripcion: 'Refresco de cola de 1 litro', precio: 100.00, categoria: catBebidas._id }
    ]);
    console.log('✅ Platillos creados');

    // Crear Mesas de ejemplo
    await Mesa.create([
      { numero_mesa: 1, capacidad: 4, estado: 'LIBRE' },
      { numero_mesa: 2, capacidad: 2, estado: 'LIBRE' },
      { numero_mesa: 3, capacidad: 6, estado: 'LIBRE' }
    ]);
    console.log('✅ Mesas listas');

    console.log('🚀 Base de datos poblada exitosamente');
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    // Desconectar Mongoose al terminar
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

seedDB();
