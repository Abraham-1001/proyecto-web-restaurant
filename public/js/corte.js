document.addEventListener('DOMContentLoaded', () => {

    const kpiIngresos = document.getElementById('kpiIngresos');
    const kpiCobrados = document.getElementById('kpiCobrados');
    const kpiPendientes = document.getElementById('kpiPendientes');
    const tablaHistorial = document.getElementById('tablaHistorial');
    const tablaCortesPasados = document.getElementById('tablaCortesPasados');
    const alertCorte = document.getElementById('alertCorte');
    const btnVolverPanel = document.getElementById('btnVolverPanel');
    const btnRealizarCorte = document.getElementById('btnRealizarCorte');

    // Detect logged-in user for "Volver" link
    const usuarioString = localStorage.getItem('usuario');
    const usuario = JSON.parse(usuarioString || '{}');
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

    let pagosPendientesDeCorte = [];

    const loadData = async () => {
        try {
            // Fetch pedidos, pagos, y cortes
            const [resPedidos, resPagos, resCortes] = await Promise.all([
                fetch('/pedidos', { headers: getHeaders() }),
                fetch('/pagos', { headers: getHeaders() }),
                fetch('/cortes', { headers: getHeaders() })
            ]);

            if (resPedidos.status === 401 || resPedidos.status === 403 || resPagos.status === 401 || resPagos.status === 403) {
                showAlert('Tu sesión ha expirado o es inválida.', 'warning');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/index.html';
                }, 2000);
                return;
            }

            let pedidos = [];
            if (resPedidos.ok) pedidos = await resPedidos.json();
            let pagos = [];
            if (resPagos.ok) pagos = await resPagos.json();
            let cortes = [];
            if (resCortes.ok) cortes = await resCortes.json();

            if (!Array.isArray(pedidos)) pedidos = [];
            if (!Array.isArray(pagos)) pagos = [];
            if (!Array.isArray(cortes)) cortes = [];

            // Calculate KPIs
            let totalIngresosHoy = 0;
            let pedidosCobradosHoy = 0;
            let pedidosPendientesCount = 0;
            
            const pedidosCobradosList = [];
            pagosPendientesDeCorte = [];

            // Filtrar pagos que NO han sido cortados
            const pagosNoCortados = pagos.filter(p => p.estado === 'EXITOSO' && p.cortado === false);

            const pedidosMap = {};
            pedidos.forEach(p => pedidosMap[p._id] = p);

            // Contar pedidos pendientes (no pagados ni cancelados)
            pedidos.forEach(pedido => {
                if (pedido.estado !== 'PAGADO' && pedido.estado !== 'CANCELADO') {
                    pedidosPendientesCount++;
                }
            });

            // Procesar pagos no cortados para la tabla de historial activo
            pagosNoCortados.forEach(pago => {
                totalIngresosHoy += pago.monto;
                pedidosCobradosHoy++;
                
                const pedidoObj = pedidosMap[pago.pedido];
                if (pedidoObj) {
                    pedidosCobradosList.push({ ...pedidoObj, pagoAsociado: pago });
                }
            });

            pagosPendientesDeCorte = pagosNoCortados; // Guardar referencia

            // Update DOM KPIs
            kpiIngresos.textContent = `$${totalIngresosHoy.toFixed(2)}`;
            kpiCobrados.textContent = pedidosCobradosHoy;
            kpiPendientes.textContent = pedidosPendientesCount;

            // Bloquear botón si no hay ventas por cortar
            btnRealizarCorte.disabled = (pagosNoCortados.length === 0);

            // Render Tables
            renderTablaActiva(pedidosCobradosList);
            renderTablaCortes(cortes);

        } catch (error) {
            console.error(error);
            showAlert('Ocurrió un error al cargar los datos.');
        }
    };

    const renderTablaActiva = (pedidosCobradosList) => {
        tablaHistorial.innerHTML = '';

        if (pedidosCobradosList.length === 0) {
            tablaHistorial.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-receipt d-block"></i>
                        No hay cobros pendientes de corte.
                    </td>
                </tr>
            `;
            return;
        }

        pedidosCobradosList.sort((a, b) => new Date(b.pagoAsociado.fecha_pago) - new Date(a.pagoAsociado.fecha_pago));

        pedidosCobradosList.forEach(pedido => {
            const mesaNum = pedido.mesa ? `Mesa ${pedido.mesa.numero_mesa}` : 'N/A';
            const meseroNombre = pedido.mesero ? `${pedido.mesero.nombre} ${pedido.mesero.apellido || ''}` : 'N/A';
            const total = parseFloat(pedido.pagoAsociado.monto || 0).toFixed(2);
            const pago = pedido.pagoAsociado;
            const metodoPago = pago ? pago.metodo_pago : 'DESCONOCIDO';
            
            const dateStr = pago.fecha_pago;

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

    const renderTablaCortes = (cortes) => {
        tablaCortesPasados.innerHTML = '';

        if (cortes.length === 0) {
            tablaCortesPasados.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state" style="padding: 20px;">
                        No hay cortes registrados.
                    </td>
                </tr>
            `;
            return;
        }

        cortes.forEach(corte => {
            const usuarioNombre = corte.usuario ? `${corte.usuario.nombre} ${corte.usuario.apellido || ''}` : 'N/A';
            const total = parseFloat(corte.total_recaudado || 0).toFixed(2);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(corte.fecha_corte)}</td>
                <td>${usuarioNombre}</td>
                <td class="fw-bold">$${total}</td>
                <td>${corte.cantidad_ventas}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light btnDescargarPdf" data-corte='${JSON.stringify(corte)}'>
                        <i class="fas fa-file-pdf text-danger"></i> PDF
                    </button>
                </td>
            `;
            tablaCortesPasados.appendChild(tr);
        });

        // Add event listeners to PDF buttons
        document.querySelectorAll('.btnDescargarPdf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const corteData = JSON.parse(e.currentTarget.getAttribute('data-corte'));
                generarPDF(corteData);
            });
        });
    };

    btnRealizarCorte.addEventListener('click', async () => {
        if (pagosPendientesDeCorte.length === 0) {
            showAlert('No hay ventas para realizar un corte.', 'warning');
            return;
        }

        if (!await ui.confirm('¿Estás seguro de realizar el Corte de Caja? Esto limpiará el historial activo.', 'Confirmar corte de caja')) {
            return;
        }

        btnRealizarCorte.disabled = true;
        btnRealizarCorte.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';

        try {
            const res = await fetch('/cortes', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ usuario: usuario._id })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(ui.friendlyError(errData, 'No se pudo procesar el corte de caja.'));
            }

            const data = await res.json();
            showAlert('Corte de caja realizado exitosamente.', 'success');

            // Generate PDF immediately after cut
            generarPDF(data.corte);

            // Reload data
            await loadData();
        } catch (error) {
            console.error(error);
            showAlert(ui.friendlyError({ error: error.message }, 'No se pudo procesar el corte de caja.'), 'danger');
        } finally {
            btnRealizarCorte.innerHTML = '<i class="fas fa-file-invoice-dollar me-1"></i> Realizar Corte de Caja';
            btnRealizarCorte.disabled = false;
        }
    });

    const generarPDF = (corte) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const usuarioNombre = corte.usuario ? (corte.usuario.nombre + " " + (corte.usuario.apellido || "")) : "N/A";
        
        const logoImg = new Image();
        logoImg.src = '/img/Logo.png';
        
        const buildPdf = (withLogo) => {
            if (withLogo) {
                doc.addImage(logoImg, 'PNG', 14, 10, 20, 20); 
                doc.setFontSize(22);
                doc.text("El Artesano", 40, 20);
                doc.setFontSize(16);
                doc.text("CORTE DE CAJA", 40, 28);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text("Folio (ID): " + corte._id, 14, 40);
                doc.text("Fecha y Hora: " + formatDate(corte.fecha_corte), 14, 46);
                doc.text("Usuario Responsable: " + usuarioNombre, 14, 52);
            } else {
                doc.setFontSize(22);
                doc.text("El Artesano - Reporte de Corte de Caja", 14, 22);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text("Folio (ID): " + corte._id, 14, 30);
                doc.text("Fecha y Hora: " + formatDate(corte.fecha_corte), 14, 36);
                doc.text("Usuario Responsable: " + usuarioNombre, 14, 42);
            }
            
            const startY = withLogo ? 60 : 50;
            
            doc.autoTable({
                startY: startY,
                head: [['Concepto', 'Total']],
                body: [
                    ['Ventas en Efectivo', '$' + parseFloat(corte.desglose.EFECTIVO || 0).toFixed(2)],
                    ['Ventas con Tarjeta', '$' + parseFloat(corte.desglose.TARJETA || 0).toFixed(2)],
                    ['Ventas por Transferencia', '$' + parseFloat(corte.desglose.TRANSFERENCIA || 0).toFixed(2)],
                    ['Cantidad Total de Ventas', corte.cantidad_ventas],
                ],
                theme: 'grid',
                headStyles: { fillColor: [255, 107, 129] }
            });

            const finalY = doc.lastAutoTable.finalY || startY;

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("TOTAL RECAUDADO: $" + parseFloat(corte.total_recaudado || 0).toFixed(2), 14, finalY + 15);

            doc.save(`corte_de_caja_${corte._id.substring(corte._id.length - 6)}.pdf`);
        };
        
        logoImg.onload = () => buildPdf(true);
        logoImg.onerror = () => buildPdf(false);
    };

    loadData();
});
