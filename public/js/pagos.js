document.addEventListener('DOMContentLoaded', () => {

    // ── DOM refs ────────────────────────────────────────────
    const pedidosList     = document.getElementById('pedidosList');
    const cobroPlaceholder= document.getElementById('cobroPlaceholder');
    const cobroContent    = document.getElementById('cobroContent');
    const cobroMesa       = document.getElementById('cobroMesa');
    const cobroMesero     = document.getElementById('cobroMesero');
    const cobroFecha      = document.getElementById('cobroFecha');
    const cobroEstado     = document.getElementById('cobroEstado');
    const cobroDetalles   = document.getElementById('cobroDetalles');
    const cobroTotal      = document.getElementById('cobroTotal');
    const metodoPago      = document.getElementById('metodoPago');
    const btnCobrar       = document.getElementById('btnCobrar');
    const alertPagos      = document.getElementById('alertPagos');
    const btnVolverPanel  = document.getElementById('btnVolverPanel');

    // ── State ───────────────────────────────────────────────
    let pedidosActivos    = [];   // pedidos with estado != PAGADO && != CANCELADO
    let pedidoSeleccionado = null; // currently selected pedido object

    // Detect logged-in user for "Volver" link
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (btnVolverPanel) {
        const rol = (usuario.rol || '').toUpperCase();
        if (rol === 'CAJERO') {
            btnVolverPanel.href = '/cajero.html';
        } else if (rol === 'MESERO') {
            btnVolverPanel.href = '/mesero.html';
        } else {
            btnVolverPanel.href = '/admin.html';
        }
    }

    // ── Helpers ─────────────────────────────────────────────
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const showAlert = (msg, type = 'danger') => {
        alertPagos.textContent = msg;
        alertPagos.className = `alert alert-${type}`;
        alertPagos.classList.remove('d-none');
        setTimeout(() => alertPagos.classList.add('d-none'), 6000);
    };

    const handleAuthError = (res) => {
        if (res.status === 401 || res.status === 403) {
            showAlert('Tu sesión ha expirado o es inválida.', 'warning');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/index.html';
            }, 2000);
            return true;
        }
        return false;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const estadoBadge = (estado) => {
        const map = {
            'PENDIENTE':       'bg-warning text-dark',
            'EN_PREPARACION':  'bg-info text-dark',
            'SERVIDO':         'bg-primary',
        };
        const cls = map[estado] || 'bg-secondary';
        const label = (estado || '').replace('_', ' ');
        return `<span class="badge badge-estado-pedido ${cls}">${label}</span>`;
    };

    // ══════════════════════════════════════════════════════════
    //  LOAD PEDIDOS ACTIVOS
    // ══════════════════════════════════════════════════════════
    const loadPedidos = async () => {
        try {
            const res = await fetch('/pedidos', { headers: getHeaders() });
            if (handleAuthError(res)) return;
            if (!res.ok) throw new Error('Error al obtener los pedidos');

            const data = await res.json();

            if (Array.isArray(data)) {
                // Only show pedidos that haven't been paid or cancelled
                pedidosActivos = data.filter(p =>
                    p.estado !== 'PAGADO' && p.estado !== 'CANCELADO'
                );
            } else {
                pedidosActivos = [];
            }

            renderPedidosList();
        } catch (err) {
            console.error(err);
            showAlert('Error al cargar los pedidos.');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  RENDER – Pedidos list (left column)
    // ══════════════════════════════════════════════════════════
    const renderPedidosList = () => {
        pedidosList.innerHTML = '';

        if (pedidosActivos.length === 0) {
            pedidosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle d-block"></i>
                    <h5>Sin pedidos pendientes</h5>
                    <p style="font-size:.9rem;">Todas las cuentas han sido cobradas.</p>
                </div>`;
            return;
        }

        pedidosActivos.forEach((pedido, idx) => {
            const mesaNum  = pedido.mesa ? `Mesa ${pedido.mesa.numero_mesa}` : 'Mesa ?';
            const mesero   = pedido.mesero ? `${pedido.mesero.nombre}${pedido.mesero.apellido ? ' ' + pedido.mesero.apellido : ''}` : 'Sin asignar';
            const total    = parseFloat(pedido.total || 0).toFixed(2);
            const isSelected = pedidoSeleccionado && pedidoSeleccionado._id === pedido._id;

            const col = document.createElement('div');
            col.className = 'pedido-col mb-2';
            col.style.animationDelay = `${Math.min(idx * 0.05, 0.4)}s`;

            col.innerHTML = `
                <div class="pedido-card ${isSelected ? 'selected' : ''}" data-id="${pedido._id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="mesa-tag"><i class="fas fa-chair"></i>${mesaNum}</div>
                            <div class="pedido-meta"><i class="fas fa-user me-1"></i>${mesero}</div>
                            <div class="pedido-meta"><i class="fas fa-clock me-1"></i>${formatDate(pedido.fecha)}</div>
                        </div>
                        <div class="text-end">
                            <div class="pedido-total-badge">$${total}</div>
                            <div class="mt-1">${estadoBadge(pedido.estado)}</div>
                        </div>
                    </div>
                </div>`;

            col.querySelector('.pedido-card').addEventListener('click', () => selectPedido(pedido));
            pedidosList.appendChild(col);
        });
    };

    // ══════════════════════════════════════════════════════════
    //  SELECT PEDIDO – Populate cobro panel
    // ══════════════════════════════════════════════════════════
    const selectPedido = (pedido) => {
        pedidoSeleccionado = pedido;

        // Highlight card
        renderPedidosList();

        // Show cobro content
        cobroPlaceholder.classList.add('d-none');
        cobroContent.classList.remove('d-none');
        cobroContent.style.display = 'flex';

        // Info rows
        cobroMesa.textContent   = pedido.mesa ? `Mesa ${pedido.mesa.numero_mesa}  (${pedido.mesa.capacidad} pers.)` : 'N/A';
        cobroMesero.textContent = pedido.mesero ? `${pedido.mesero.nombre}${pedido.mesero.apellido ? ' ' + pedido.mesero.apellido : ''}` : 'N/A';
        cobroFecha.textContent  = formatDate(pedido.fecha);
        cobroEstado.innerHTML   = estadoBadge(pedido.estado);

        // Detalles (platillos)
        cobroDetalles.innerHTML = '';
        if (pedido.detalles && pedido.detalles.length > 0) {
            pedido.detalles.forEach(det => {
                const nombre = det.platillo ? det.platillo.nombre : 'Platillo desconocido';
                const row = document.createElement('div');
                row.className = 'detalle-item';
                row.innerHTML = `
                    <div>
                        <span>${nombre}</span>
                        <span class="item-qty">x${det.cantidad}</span>
                    </div>
                    <span class="item-sub">$${parseFloat(det.subtotal || 0).toFixed(2)}</span>`;
                cobroDetalles.appendChild(row);
            });
        } else {
            cobroDetalles.innerHTML = '<p class="text-center" style="color:rgba(255,255,255,.4);">Sin detalles</p>';
        }

        // Total
        cobroTotal.textContent = '$' + parseFloat(pedido.total || 0).toFixed(2);

        // Reset payment method
        metodoPago.value = 'EFECTIVO';
    };

    // ══════════════════════════════════════════════════════════
    //  COBRAR – POST /pagos
    // ══════════════════════════════════════════════════════════
    btnCobrar.addEventListener('click', async () => {
        if (!pedidoSeleccionado) {
            showAlert('Selecciona un pedido antes de cobrar.', 'warning');
            return;
        }

        if (!confirm(`¿Confirmar cobro de $${parseFloat(pedidoSeleccionado.total).toFixed(2)} con ${metodoPago.value}?`)) {
            return;
        }

        // Build payload matching pagoModel
        const payload = {
            pedido: pedidoSeleccionado._id,
            monto: pedidoSeleccionado.total,
            metodo_pago: metodoPago.value
        };

        btnCobrar.disabled = true;
        btnCobrar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';

        try {
            const res = await fetch('/pagos', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (handleAuthError(res)) return;

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || errData.error || 'Error al procesar el pago');
            }

            // Show success overlay
            showSuccessOverlay(pedidoSeleccionado, metodoPago.value);

            // Reset state
            pedidoSeleccionado = null;
            cobroContent.classList.add('d-none');
            cobroContent.style.display = 'none';
            cobroPlaceholder.classList.remove('d-none');

            // Refresh pedidos list
            await loadPedidos();

        } catch (err) {
            showAlert(err.message, 'danger');
        } finally {
            btnCobrar.disabled = false;
            btnCobrar.innerHTML = '<i class="fas fa-check-circle me-2"></i>Cobrar Cuenta y Liberar Mesa';
        }
    });

    // ══════════════════════════════════════════════════════════
    //  SUCCESS OVERLAY
    // ══════════════════════════════════════════════════════════
    const showSuccessOverlay = (pedido, metodo) => {
        const mesaNum = pedido.mesa ? pedido.mesa.numero_mesa : '?';
        const total   = parseFloat(pedido.total || 0).toFixed(2);

        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-card">
                <div class="check-icon"><i class="fas fa-check-circle"></i></div>
                <h3>¡Pago Exitoso!</h3>
                <p>Mesa ${mesaNum} cobrada correctamente</p>
                <div style="font-size:1.8rem; font-weight:700; color:#7bed9f; margin:12px 0;">$${total}</div>
                <p style="font-size:.85rem; margin-bottom:0;">Método: ${metodo} · Mesa liberada</p>
            </div>`;

        document.body.appendChild(overlay);

        // Auto-dismiss
        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity .4s ease';
            setTimeout(() => overlay.remove(), 400);
        }, 2500);

        // Click to dismiss early
        overlay.addEventListener('click', () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity .3s ease';
            setTimeout(() => overlay.remove(), 300);
        });
    };

    // ══════════════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════════════
    loadPedidos();
});
