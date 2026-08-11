const express = require('express');
const app = express();
const { port } = require('./config/config');

const rutaCategoria = require('./routes/rutaCategoria');
const rutaMesa = require('./routes/rutaMesa');
const rutaPago = require('./routes/rutaPago');
const rutaUsuarios = require('./routes/rutaUsuarios');
const rutaPlatillo = require('./routes/rutaPlatillo');
const rutaPedido = require('./routes/rutaPedido');
const rutaCorte = require('./routes/rutaCorte');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

app.use('/categorias', rutaCategoria);
app.use('/mesas', rutaMesa);
app.use('/pagos', rutaPago);
app.use('/usuarios', rutaUsuarios);
app.use('/platillos', rutaPlatillo);
app.use('/pedidos', rutaPedido);
app.use('/cortes', rutaCorte);


module.exports = {
    app,
    port
};