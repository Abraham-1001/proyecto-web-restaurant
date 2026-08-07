document.addEventListener('DOMContentLoaded', () => {

    const kpiIngresos = document.getElementById('kpiIngresos');
    const kpiCobrados = document.getElementById('kpiCobrados');
    const kpiPendientes = document.getElementById('kpiPendientes');
    const tablaHistorial = document.getElementById('tablaHistorial');
    const alertCorte = document.getElementById('alertCorte');
    const btnVolverPanel = document.getElementById('btnVolverPanel');

    // Detect logged-in user for "Volver" link
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (btnVolverPanel) {
        const rol = (usuario.rol || '').toUpperCase();
        if (rol === 'CAJERO') {
            btnVolverPanel.href = '/cajero.html';
        } else {
            btnVolverPanel.href = '/admin.html';
        }
    }

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const showAlert = (msg, type = 'danger') => {
        alertCorte.textContent = msg;
        alertCorte.className = `alert alert-${type}`;
        alertCorte.classList.remove('d-none');
        setTimeout(() => alertCorte.classList.add('d-none'), 5000);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    // Check if a date is today (local time roughly)
    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    };

    const loadData = async () => {
        try {
            // Fetch both pedidos and pagos
            const [resPedidos, resPagos] = await Promise.all([
                fetch('/pedidos', { headers: getHeaders() }),
                fetch('/pagos', { headers: getHeaders() })
            ]);

            if (resPedidos.status === 401 || resPedidos.status === 403 || resPagos.status === 401 || resPagos.status === 403) {
                showAlert('Tu sesión ha expirado o es inválida.', 'warning');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/index.html';
                }, 2000);
                return;
            }

            if (!resPedidos.ok) throw new Error('Error al obtener los pedidos');
            if (!resPagos.ok) throw new Error('Error al obtener los pagos');

            let pedidos = await resPedidos.json();
            let pagos = await resPagos.json();

            if (!Array.isArray(pedidos)) pedidos = [];
            if (!Array.isArray(pagos)) pagos = [];

            // Calculate KPIs
            let totalIngresosHoy = 0;
            let pedidosCobradosHoy = 0;
            let pedidosPendientesCount = 0;

            const pagosMap = {};
            pagos.forEach(p => {
                pagosMap[p.pedido] = p; // assuming p.pedido is the Object ID of the pedido
            });

            const pedidosCobradosList = [];

            pedidos.forEach(pedido => {
                if (pedido.estado === 'PAGADO') {
                    // It's a paid order. Check if it has a payment record and if it's from today.
                    const pago = pagosMap[pedido._id];
                    // We assume it's today if either pago.fecha_pago is today, or pedido.fecha is today
                    const dateToCheck = (pago && pago.fecha_pago) ? pago.fecha_pago : pedido.fecha;
                    
                    if (isToday(dateToCheck)) {
                        totalIngresosHoy += parseFloat(pedido.total || 0);
                        pedidosCobradosHoy++;
                    }
                    
                    // Add to table list
                    pedidosCobradosList.push({ ...pedido, pagoAsociado: pago });

                } else if (pedido.estado !== 'CANCELADO') {
                    pedidosPendientesCount++;
                }
            });

            // Update DOM KPIs
            kpiIngresos.textContent = `$${totalIngresosHoy.toFixed(2)}`;
            kpiCobrados.textContent = pedidosCobradosHoy;
            kpiPendientes.textContent = pedidosPendientesCount;

            // Render Table
            renderTable(pedidosCobradosList);

        } catch (error) {
            console.error(error);
            showAlert('Ocurrió un error al cargar los datos.');
        }
    };

    const renderTable = (pedidosCobradosList) => {
        tablaHistorial.innerHTML = '';

        if (pedidosCobradosList.length === 0) {
            tablaHistorial.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-receipt d-block"></i>
                        No hay cobros registrados aún.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort descending by date
        pedidosCobradosList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        pedidosCobradosList.forEach(pedido => {
            const mesaNum = pedido.mesa ? `Mesa ${pedido.mesa.numero_mesa}` : 'N/A';
            const meseroNombre = pedido.mesero ? `${pedido.mesero.nombre} ${pedido.mesero.apellido || ''}` : 'N/A';
            const total = parseFloat(pedido.total || 0).toFixed(2);
            const pago = pedido.pagoAsociado;
            const metodoPago = pago ? pago.metodo_pago : 'DESCONOCIDO';
            
            // Prefer the payment date, otherwise the order date
            const dateStr = (pago && pago.fecha_pago) ? pago.fecha_pago : pedido.fecha;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${mesaNum}</td>
                <td>${meseroNombre}</td>
                <td>${formatDate(dateStr)}</td>
                <td><span class="badge-metodo">${metodoPago}</span></td>
                <td class="fw-bold">$${total}</td>
                <td><span class="badge badge-estado badge-pagado">PAGADO</span></td>
            `;
            tablaHistorial.appendChild(tr);
        });
    };

    loadData();
});
