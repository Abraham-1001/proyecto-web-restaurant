const express = require('express');
const app = express();
const port = 3000;

const rutaCategoria = require('./routes/rutaCategoria');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/categorias', rutaCategoria);

module.exports = { 
    app, 
    port 
};