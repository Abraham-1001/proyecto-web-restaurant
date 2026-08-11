const modeloPlatillo = require('../models/platilloModel');
const modeloCategoria = require('../models/categoriaModel'); // para validar la categoria
const modeloPedido = require('../models/pedidoModel'); // para validar si hay pedidos asociados al platillo

function CrearPlatillo(req, res) {
    modeloCategoria.findById(req.body.categoria)
        .then((categoria) => {
            if (!categoria) {
                return res.status(404).json({message: "La categoria no existe."});
            }
            return new modeloPlatillo(req.body).save();
        })    
        .then((platillo) => {
            if (!platillo) return;
            res.status(201).json({message: "Platillo creado correctamente", platillo});
        })
        .catch((error) => {
            res.status(400).json({error: error.message});
        });
}

function ObtenerPlatillos(req, res) {
    modeloPlatillo.find().populate("categoria")
        .then((platillos) => {
            if(platillos.length === 0) {
                return res.status(200).json({ message: 'No se encontraron platillos' });
            }
            res.status(200).json(platillos);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarPlatillo(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    console.log(consulta);
    modeloPlatillo.findOne(consulta).populate("categoria")
        .then((platillo) => {
            if(!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }
            res.status(200).json({ message: 'Consulta realizada correctamente', platillo });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

async function EliminarPlatillo(req, res) {
    try {
        const consulta = {};
        consulta[req.params.key] = req.params.value;

        const platillo = await modeloPlatillo.findOne(consulta);
        if (!platillo) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        const pedido = await modeloPedido.findOne({ "detalles.platillo": platillo._id });
        if (pedido) {
            return res.status(400).json({ message: 'No se puede eliminar el platillo porque hay pedidos asociados a él' });
        }

        await modeloPlatillo.findByIdAndDelete(platillo._id);
        return res.status(200).json({ message: 'Platillo eliminado correctamente' });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

function ModificarPlatillo(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    if(req.body.categoria) {
        return modeloCategoria.findById(req.body.categoria)
            .then((categoria) => {
                if (!categoria) {
                    return res.status(404).json({message: "La categoria no existe."});
                }
                return modeloPlatillo.findOneAndUpdate(consulta, req.body, { returnDocument: 'after', runValidators: true });
            })
            .then((platillo) => {
                if(!platillo) {
                    return res.status(404).json({ message: 'Platillo no encontrado' });
                }
                res.status(200).json({ message: 'Platillo modificado correctamente', platillo });
            })
            .catch((error) => {
                res.status(400).json({ error: error.message });
            });
    }
    modeloPlatillo.findOneAndUpdate(consulta, req.body, { returnDocument: 'after', runValidators: true })
        .then((platillo) => {
            if(!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }
            res.status(200).json({ message: 'Platillo modificado correctamente', platillo });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

module.exports = {
    CrearPlatillo,
    ObtenerPlatillos,
    ConsultarPlatillo,
    EliminarPlatillo,
    ModificarPlatillo
};