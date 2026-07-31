const modeloPlatillo = require('../models/platilloModel');
const modeloCategoria = require('../models/categoriaModel'); // para validar la categoria

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
            res.status(200).json({message: "Platillo creado correctamente", platillo});
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

function EliminarPlatillo(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloPlatillo.findOneAndDelete(consulta)
        .then((platillo) => {
            if(!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }
            res.status(200).json({ message: 'Platillo eliminado correctamente'});
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
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
                return modeloPlatillo.findOneAndUpdate(consulta, req.body, { new: true });
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
    modeloPlatillo.findOneAndUpdate(consulta, req.body, { new: true })
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