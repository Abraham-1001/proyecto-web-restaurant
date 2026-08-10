const modeloCategoria = require('../models/categoriaModel');
const modeloPlatillo = require('../models/platilloModel'); // para validar si hay platillos asociados a la categoria

function CrearCategoria(req, res) {
    console.log(req.body);
    new modeloCategoria(req.body).save()
        .then((categoria) => {
            res.status(201).json({ message: 'Categoria creada correctamente', categoria });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ObtenerCategorias(req, res) {
    modeloCategoria.find()
        .then((categorias) => {
            if(categorias.length === 0) {
                const categoriasDefecto = [
                    { nombre: 'Pizza' },
                    { nombre: 'Bebida' },
                    { nombre: 'Entrada' },
                    { nombre: 'Postre' }
                ];
                return modeloCategoria.insertMany(categoriasDefecto)
                    .then((nuevas) => res.status(200).json(nuevas));
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
    modeloCategoria.findOne(consulta)
        .then((categoria) => {
            if(!categoria) {
                return res.status(404).json({ message: 'Categoria no encontrada' });
            }
            return modeloPlatillo.findOne({ categoria: categoria._id })
            .then((platillo) => {
                if(platillo) {
                    return res.status(400).json({ message: 'No se puede eliminar la categoria porque hay platillos asociados a ella' });
                }
                return modeloCategoria.findByIdAndDelete(categoria._id);
            });
        })
        .then((categoriaEliminada) => {
            if(!categoriaEliminada) return;
            res.status(200).json({ message: 'Categoria eliminada correctamente'});
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ModificarCategoria(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloCategoria.findOneAndUpdate(consulta, req.body, { returnDocument: 'after', runValidators: true })
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