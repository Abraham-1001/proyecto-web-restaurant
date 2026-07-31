const modeloPedido = require('../models/pedidoModel');
const modeloMesa = require('../models/mesaModel');
const modeloUsuario = require('../models/usuarioModel');
const modeloPlatillo = require('../models/platilloModel');

async function CrearPedido(req, res) {
    try {
        const mesero = await modeloUsuario.findById(req.body.mesero);
        if (!mesero) {
            return res.status(404).json({message: "El mesero no existe."});
        }
        if (mesero.rol !== "Mesero") {
            return res.status(400).json({message: "El usuario no es un mesero."});
        }
        if (!mesero.estado) {
            return res.status(400).json({message: "El mesero no está activo."});
        }
        const mesa = await modeloMesa.findById(req.body.mesa);
        if (!mesa) {
            return res.status(404).json({message: "La mesa no existe." });
        }
        if (mesa.estado !== "LIBRE") {
            return res.status(400).json({message: "La mesa ya está ocupada."});
        }
        if (!req.body.detalles || req.body.detalles.length === 0) {
            return res.status(400).json({message: "El pedido debe contener al menos un platillo."});
        }
        let total = 0;
        const detallesCalculados = [];
        for (const detalle of req.body.detalles) {
            const platillo = await modeloPlatillo.findById(detalle.platillo);
            if (!platillo) {
                return res.status(404).json({message: "Uno de los platillos no existe."});
            }
            if (!platillo.disponible) {
                return res.status(400).json({message: "El platillo " + platillo.nombre + " no está disponible."});
            }
            const subtotal = detalle.cantidad * platillo.precio;
            total += subtotal;
            detallesCalculados.push({
                platillo: platillo._id,
                cantidad: detalle.cantidad,
                precio_unitario: platillo.precio,
                subtotal: subtotal
            });
        }
        const pedido = new modeloPedido({
            mesero: req.body.mesero,
            mesa: req.body.mesa,
            detalles: detallesCalculados,
            total: total
        });
        await pedido.save();
        mesa.estado = "OCUPADA";
        await mesa.save();
        return res.status(201).json({message: "Pedido creado correctamente.",pedido});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

function ObtenerPedidos(req, res) {
    modeloPedido.find()
        .populate("mesero")
        .populate("mesa")
        .populate("detalles.platillo")
        .then((pedidos) => {
            if(pedidos.length === 0) {
                return res.status(200).json({ message: 'No se encontraron pedidos' });
            }
            res.status(200).json(pedidos);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarPedido(req, res) {
    const consulta = {};
    consulta[req.params.key] = req.params.value;
    modeloPedido.findOne(consulta)
        .populate("mesero")
        .populate("mesa")
        .populate("detalles.platillo")
        .then((pedido) => {
            if (!pedido) {
                return res.status(404).json({message: "Pedido no encontrado"});
            }
            res.status(200).json({message: "Consulta realizada correctamente", pedido});
        })
        .catch((error) => {
            res.status(400).json({error: error.message});
        });
}

async function EliminarPedido(req, res) {
    try {
        const consulta = {};
        consulta[req.params.key] = req.params.value;
        const pedido = await modeloPedido.findOne(consulta);
        if (!pedido) {
            return res.status(404).json({message: "Pedido no encontrado"});
        }
        const mesa = await modeloMesa.findById(pedido.mesa);
        if (mesa) {
            mesa.estado = "LIBRE";
            await mesa.save();
        }
         await modeloPedido.findOneAndDelete(consulta);

        return res.status(200).json({message: "Pedido eliminado correctamente"});
    }
    catch (error) {
        return res.status(400).json({error: error.message});
    }
}

function ModificarPedido(req, res) {
    const consulta = {};
    consulta[req.params.key] = req.params.value;
    if (!req.body.estado) {
        return res.status(400).json({message: "Debes enviar un estado para modificar el pedido."});
    }
    modeloPedido.findOne(consulta)
        .then((pedido) => {
            if (!pedido) {
                return res.status(404).json({message: "Pedido no encontrado"});
            }
            pedido.estado = req.body.estado;
            return pedido.save();
        })
        .then((pedidoActualizado) => {
            if (pedidoActualizado.estado === "PAGADO"||pedidoActualizado.estado === "CANCELADO") {
                return modeloMesa.findById(pedidoActualizado.mesa)
                    .then((mesa) => {
                        if (mesa) {
                            mesa.estado = "LIBRE";
                            return mesa.save();
                        }
                    })
                    .then(() => pedidoActualizado);
            }
            return pedidoActualizado;
        })
        .then((pedido) => {
            res.status(200).json({message: "Pedido modificado correctamente",pedido});
        })
        .catch((error) => {
            res.status(400).json({error: error.message});
        });
}

/*function ModificarPedido(req, res) {
    const consulta = {};
    consulta[req.params.key] = req.params.value;
    modeloPedido.findOneAndUpdate(consulta,{estado: req.body.estado},{new: true})
    .then((pedido) => {
        if (!pedido) {
            return res.status(404).json({message: "Pedido no encontrado"});
        }
        res.status(200).json({message: "Pedido modificado correctamente",pedido});
    })
    .catch((error) => {
        res.status(400).json({error: error.message});
    });
}*/

module.exports = {
    CrearPedido,
    ObtenerPedidos,
    ConsultarPedido,
    EliminarPedido,
    ModificarPedido
};