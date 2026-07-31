const modeloPago = require('../models/pagoModel');
const modeloPedido = require('../models/pedidoModel'); // para validar si existe el pedido
const modeloMesa = require('../models/mesaModel'); // para validar si existe la mesa

function CrearPago(req, res) {
    modeloPedido.findById(req.body.pedido)
        .then((pedido) => {
            if (!pedido) {
                return res.status(404).json({message: "El pedido no existe."});
            }
            if (pedido.estado === "PAGADO") {
                return res.status(400).json({message: "El pedido ya está pagado."});
            }
            if (req.body.monto !== pedido.total) {
                return res.status(400).json({message: "El monto del pago no coincide con el total del pedido."});
            }
            return new modeloPago(req.body).save()
                .then((pago) => {
                    pedido.estado = "PAGADO";
                    return pedido.save()
                        .then(() => {
                            return modeloMesa.findById(pedido.mesa)
                                .then((mesa) => { 
                                    if (mesa) {
                                        mesa.estado = "LIBRE";
                                        return mesa.save();
                                    }
                                    return null;
                                })
                                .then(() => pago);
                            });
                });
        })
        .then((pago) => {
            if (!pago) return;
            res.status(201).json({message:"Pago creado correctamente", pago});
        })
        .catch((error) => {
            res.status(400).json({error:error.message});
        });
}

function ObtenerPagos(req, res) {
    modeloPago.find()
        .then((pagos) => {
            if(pagos.length === 0) {
                return res.status(200).json({ message: 'No se encontraron pagos' });
            }
            res.status(200).json(pagos);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ConsultarPago(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    console.log(consulta);
    modeloPago.findOne(consulta)
        .then((pago) => {
            if(!pago) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            res.status(200).json({ message: 'Consulta realizada correctamente', pago });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function EliminarPago(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloPago.findOneAndDelete(consulta)
        .then((pago) => {
            if(!pago) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            res.status(200).json({ message: 'Pago eliminado correctamente'});
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

function ModificarPago(req, res) {
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloPago.findOneAndUpdate(consulta, { metodo_pago:req.body.metodo_pago, estado:req.body.estado }, { new: true })
        .then((pago) => {
            if(!pago) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            res.status(200).json({ message: 'Pago modificado correctamente', pago });
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
}

module.exports = {
    CrearPago,
    ObtenerPagos,
    ConsultarPago,
    EliminarPago,
    ModificarPago
};