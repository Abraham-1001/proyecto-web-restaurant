const modeloCategoria = require('../models/categoriaModel');

function CrearCategoria(req, res) {
    console.log(req.body);
    new modeloCategoria(req.body).save()
        .then((categoria) => {
            res.status(200).json({ message: 'Categoria creada correctamente', categoria });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ObtenerCategorias(req, res) {
    modeloCategoria.find()
        .then((categorias) => {
            if(!categorias) {
                return res.status(404).json({ message: 'No se encontraron categorias' });
            }
            res.status(200).json(categorias);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarCategoria(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    console.log(consulta);
    modeloCategoria.findOne(consulta)
        .then((categoria) => {
            if(!categoria) {
                return res.status(404).json({ message: 'Categoria no encontrada' });
            }
            res.status(200).json({ message: 'Consulta realizada correctamente', categoria });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function EliminarCategoria(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloCategoria.findOneAndDelete(consulta)
        .then((categoria) => {
            if(!categoria) {
                return res.status(404).json({ message: 'Categoria no encontrada' });
            }
            res.status(200).json({ message: 'Categoria eliminada correctamente'});
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ModificarCategoria(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloCategoria.findOneAndUpdate(consulta, req.body, { new: true })
        .then((categoria) => {
            if(!categoria) {
                return res.status(404).json({ message: 'Categoria no encontrada' });
            }
            res.status(200).json({ message: 'Categoria modificada correctamente', categoria });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

module.exports = {
    CrearCategoria,
    ObtenerCategorias,
    ConsultarCategoria,
    EliminarCategoria,
    ModificarCategoria
};