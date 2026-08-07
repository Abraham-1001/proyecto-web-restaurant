const modeloCorte = require('../models/corteModel');
const modeloPago = require('../models/pagoModel');
const modeloUsuario = require('../models/usuariosModel');

async function CrearCorte(req, res) {
    try {
        const usuarioId = req.body.usuario;
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario para realizar el corte." });
        }

        const usuario = await modeloUsuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        if (usuario.rol !== "CAJERO" && usuario.rol !== "ADMIN") {
            return res.status(403).json({ message: "No tienes permisos para realizar cortes de caja." });
        }

        // VALIDACIÓN IMPORTANTE: No permitir el corte si hay pedidos pendientes
        const modeloPedido = require('../models/pedidoModel');
        const pedidosPendientes = await modeloPedido.countDocuments({
            estado: { $nin: ['PAGADO', 'CANCELADO'] }
        });

        if (pedidosPendientes > 0) {
            return res.status(400).json({ 
                message: `No se puede realizar el corte. Existen ${pedidosPendientes} pedidos pendientes que deben ser finalizados o pagados primero.` 
            });
        }

        // Buscar todos los pagos exitosos que no han sido cortados
        const pagosPendientes = await modeloPago.find({ cortado: false, estado: 'EXITOSO' });

        if (pagosPendientes.length === 0) {
            return res.status(400).json({ message: "No hay ventas pendientes para realizar un corte." });
        }

        let totalRecaudado = 0;
        let desglose = {
            EFECTIVO: 0,
            TARJETA: 0,
            TRANSFERENCIA: 0
        };
        const ventasIncluidas = [];

        pagosPendientes.forEach(pago => {
            totalRecaudado += pago.monto;
            if (desglose[pago.metodo_pago] !== undefined) {
                desglose[pago.metodo_pago] += pago.monto;
            }
            ventasIncluidas.push(pago._id);
        });

        // Crear el registro del corte
        const nuevoCorte = new modeloCorte({
            usuario: usuarioId,
            total_recaudado: totalRecaudado,
            cantidad_ventas: pagosPendientes.length,
            desglose: desglose,
            ventas_incluidas: ventasIncluidas
        });

        const corteGuardado = await nuevoCorte.save();

        // Actualizar los pagos para marcarlos como cortados
        await modeloPago.updateMany(
            { _id: { $in: ventasIncluidas } },
            { $set: { cortado: true, corte_id: corteGuardado._id } }
        );

        // Opcional: Popular el usuario para devolverlo en la respuesta (útil para el PDF)
        await corteGuardado.populate('usuario');

        return res.status(201).json({
            message: "Corte de caja realizado exitosamente.",
            corte: corteGuardado
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function ObtenerCortes(req, res) {
    try {
        const cortes = await modeloCorte.find().populate('usuario', 'nombre apellido rol').sort({ fecha_corte: -1 });
        if (cortes.length === 0) {
            return res.status(200).json({ message: 'No se encontraron cortes de caja.' });
        }
        return res.status(200).json(cortes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    CrearCorte,
    ObtenerCortes
};
