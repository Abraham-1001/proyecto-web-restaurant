const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  }
});

const categoriaModel = mongoose.model('Categoria', categoriaSchema);

module.exports = categoriaModel;