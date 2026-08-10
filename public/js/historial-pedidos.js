document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('tablaPedidos');
    const buscar = document.getElementById('buscarPedido');
    const filtroEstado = document.getElementById('filtroEstado');
    const totalPedidos = document.getElementById('totalPedidos');
    const alerta = document.getElementById('alertHistorial');
    const btnVolverPanel = document.getElementById('btnVolverPanel');
    let pedidos = [];


    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = (usuario.rol || '').toUpperCase();
    const puedeEditar = rol === 'ADMIN' || rol === 'MESERO';
    if (rol === 'CAJERO') btnVolverPanel.href = '/cajero.html';
    if (rol === 'MESERO') btnVolverPanel.href = '/mesero.html';
    if (rol === 'ADMIN') btnVolverPanel.href = '/admin.html';

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const nombrePersona = (persona, fallback) => persona
        ? `${persona.nombre || ''} ${persona.apellido || ''}`.trim()
        : fallback;

    const formatDate = (date) => date ? new Date(date).toLocaleString('es-MX', {
        dateStyle: 'medium', timeStyle: 'short'
    }) : 'Sin fecha';

    const estadoClase = (estado) => ({
        PAGADO: 'text-bg-success', CANCELADO: 'text-bg-danger',
        SERVIDO: 'text-bg-primary', EN_PREPARACION: 'text-bg-info',
        PENDIENTE: 'text-bg-warning'
    }[estado] || 'text-bg-secondary');

    const estadosEditables = ['PENDIENTE', 'EN_PREPARACION', 'SERVIDO', 'CANCELADO'];

    const renderEditor = (pedido) => {
        if (!puedeEditar || pedido.estado === 'PAGADO') return '<span class="text-white-50">No editable</span>';
        const opciones = estadosEditables.map(estado =>
            `<option value="${estado}" ${estado === pedido.estado ? 'selected' : ''}>${estado.replace('_', ' ')}</option>`
        ).join('');
        return `<div class="d-flex gap-2 align-items-center">
            <select class="form-select form-select-sm status-select" data-status-id="${escapeHtml(pedido._id)}" aria-label="Nuevo estado del pedido">${opciones}</select>
            <button class="btn btn-sm btn-guardar" type="button" data-save-id="${escapeHtml(pedido._id)}" title="Guardar estado"><i class="fas fa-save"></i></button>
        </div>`;
    };

    const mostrarAlerta = (mensaje) => {
        alerta.textContent = mensaje;
        alerta.className = 'alert alert-danger';
    };

    const render = () => {
        const termino = buscar.value.trim().toLowerCase();
        const estado = filtroEstado.value;
        const filtrados = pedidos.filter((pedido) => {
            const mesa = pedido.mesa ? `mesa ${pedido.mesa.numero_mesa}` : '';
            const mesero = nombrePersona(pedido.mesero, 'sin asignar');
            const platillos = (pedido.detalles || []).map(d => d.platillo?.nombre || '').join(' ');
            const coincideTexto = `${mesa} ${mesero} ${platillos}`.toLowerCase().includes(termino);
            return coincideTexto && (estado === 'TODOS' || pedido.estado === estado);
        });

        totalPedidos.textContent = `${filtrados.length} pedido${filtrados.length === 1 ? '' : 's'}`;
        if (!filtrados.length) {
            tabla.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-receipt d-block"></i>No hay pedidos que coincidan con la consulta.</td></tr>';
            return;
        }

        tabla.innerHTML = filtrados.map((pedido) => {
            const detalles = (pedido.detalles || []).map(d => `${d.cantidad}x ${d.platillo?.nombre || 'Platillo'}`).join(', ');
            const mesa = pedido.mesa ? `Mesa ${pedido.mesa.numero_mesa}` : 'Sin mesa';
            const mesero = nombrePersona(pedido.mesero, 'Sin asignar');
            return `<tr>
                <td><span class="order-id">#${escapeHtml(String(pedido._id).slice(-6))}</span></td>
                <td>${escapeHtml(formatDate(pedido.fecha))}</td>
                <td>${escapeHtml(mesa)}</td>
                <td>${escapeHtml(mesero)}</td>
                <td>${escapeHtml(detalles || 'Sin detalle')}</td>
                <td><span class="badge ${estadoClase(pedido.estado)} badge-estado">${escapeHtml((pedido.estado || 'SIN ESTADO').replace('_', ' '))}</span></td>
                <td class="text-end fw-semibold">$${Number(pedido.total || 0).toFixed(2)}</td>
                <td class="action-cell">${renderEditor(pedido)}</td>
            </tr>`;
        }).join('');

        tabla.querySelectorAll('[data-save-id]').forEach(button => {
            button.addEventListener('click', () => actualizarEstado(button.dataset.saveId));
        });
    };

    const actualizarEstado = async (id) => {
        const select = tabla.querySelector(`[data-status-id="${id}"]`);
        const estado = select?.value;
        if (!estado) return;
        try {
            const response = await fetch(`/pedidos/_id/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado })
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.replace('/index.html');
                return;
            }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'No se pudo actualizar el pedido.');
            const indice = pedidos.findIndex(pedido => pedido._id === id);
            if (indice !== -1) pedidos[indice] = data.pedido;
            render();
        } catch (error) {
            mostrarAlerta(error.message);
        }
    };

    const cargarPedidos = async () => {
        try {
            const response = await fetch('/pedidos', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.replace('/index.html');
                return;
            }
            if (!response.ok) throw new Error('No se pudieron consultar los pedidos.');
            const data = await response.json();
            pedidos = Array.isArray(data) ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
            render();
        } catch (error) {
            mostrarAlerta(error.message);
        }
    };

    buscar.addEventListener('input', render);
    filtroEstado.addEventListener('change', render);
    cargarPedidos();
});
