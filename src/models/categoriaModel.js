const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  descripcion: {
    type: String,
    required: false
  }
});

const categoriaModel = mongoose.model('Categoria', categoriaSchema);

module.exports = categoriaModel;