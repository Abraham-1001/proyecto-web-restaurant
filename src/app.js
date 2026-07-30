const express = require('express');
const app = express();
const port = 3000;

const rutaCategoria = require('./routes/rutaCategoria');
const rutaMesa = require('./routes/rutaMesa');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/categorias', rutaCategoria);
app.use('/mesas', rutaMesa);

module.exports = { 
    app, 
    port 
};