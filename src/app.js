const express = require('express');
const app = express();
const port = 3000;

const rutaCategoria = require('./routes/rutaCategoria');
const rutaMesa = require('./routes/rutaMesa');
const rutaPago = require('./routes/rutaPago');
const rutaUsuarios = require('./routes/rutaUsuarios');
const rutaPlatillo = require('./routes/rutaPlatillo');
const rutaPedido = require('./routes/rutaPedido');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/categorias', rutaCategoria);
app.use('/mesas', rutaMesa);
app.use('/pagos', rutaPago);
app.use('/usuarios', rutaUsuarios);
app.use('/platillos', rutaPlatillo);
app.use('/pedidos', rutaPedido);


module.exports = { 
    app, 
    port 
};