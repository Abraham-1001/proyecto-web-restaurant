const modeloMesa = require('../models/mesaModel');
const modeloPedido = require('../models/pedidoModel');

function CrearMesa(req, res) {
    console.log(req.body);
    new modeloMesa(req.body).save()
        .then((mesa) => {
            res.status(201).json({ message: 'Mesa creada correctamente', mesa });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ObtenerMesas(req, res) {
    modeloMesa.find()
        .then((mesas) => {
            if(mesas.length === 0) {
                return res.status(200).json({ message: 'No se encontraron mesas' });
            }
            res.status(200).json(mesas);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarMesa(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    console.log(consulta);
    modeloMesa.findOne(consulta)
        .then((mesa) => {
            if(!mesa) {
                return res.status(404).json({ message: 'Mesa no encontrada' });
            }
            res.status(200).json({ message: 'Consulta realizada correctamente', mesa });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

async function EliminarMesa(req, res) {
    try {
        const consulta = {};
        consulta[req.params.key] = req.params.value;

        const mesa = await modeloMesa.findOne(consulta);
        if (!mesa) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }

        const pedido = await modeloPedido.findOne({ mesa: mesa._id });
        if (pedido) {
            return res.status(400).json({ message: 'No se puede eliminar la mesa porque hay pedidos asociados a ella' });
        }

        await modeloMesa.findByIdAndDelete(mesa._id);
        return res.status(200).json({ message: 'Mesa eliminada correctamente' });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

function ModificarMesa(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloMesa.findOneAndUpdate(consulta, req.body, { returnDocument: 'after', runValidators: true })
        .then((mesa) => {
            if(!mesa) {
                return res.status(404).json({ message: 'Mesa no encontrada' });
            }
            res.status(200).json({ message: 'Mesa modificada correctamente', mesa });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

module.exports = {
    CrearMesa,
    ObtenerMesas,
    ConsultarMesa,
    EliminarMesa,
    ModificarMesa
};