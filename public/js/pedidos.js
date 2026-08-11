document.addEventListener('DOMContentLoaded', () => {

    // ── DOM refs ────────────────────────────────────────────
    const menuGrid        = document.getElementById('menuGrid');
    const categoryFilters = document.getElementById('categoryFilters');
    const searchInput     = document.getElementById('searchPlatillo');
    const selectMesa      = document.getElementById('selectMesa');
    const ticketItemsEl   = document.getElementById('ticketItems');
    const ticketTotalEl   = document.getElementById('ticketTotal');
    const btnEnviar       = document.getElementById('btnEnviarPedido');
    const alertPedidos    = document.getElementById('alertPedidos');
    const btnVolverPanel  = document.getElementById('btnVolverPanel');

    // ── State ───────────────────────────────────────────────
    let platillos       = [];      // all available platillos from API
    let mesasLibres     = [];      // mesas with estado === 'LIBRE'
    let ticketItems     = [];      // [{ platilloId, nombre, precio, cantidad }]
    let categorias      = [];      // unique category names for filter pills
    let activeCategory  = null;    // null = show all

    // Detect logged-in user for "Volver" link & mesero id
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (btnVolverPanel) {
        const rol = (usuarioGuardado.rol || '').toUpperCase();
        if (rol === 'MESERO') {
            btnVolverPanel.href = '/mesero.html';
        } else if (rol === 'CAJERO') {
            btnVolverPanel.href = '/cajero.html';
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
        alertPedidos.textContent = msg;
        alertPedidos.className = `alert alert-${type}`;
        alertPedidos.classList.remove('d-none');
        setTimeout(() => alertPedidos.classList.add('d-none'), 6000);
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

    // ══════════════════════════════════════════════════════════
    //  LOAD PLATILLOS
    // ══════════════════════════════════════════════════════════
    const loadPlatillos = async () => {
        try {
            const res = await fetch('/platillos', { headers: getHeaders() });
            if (handleAuthError(res)) return;
            if (!res.ok) throw new Error('Error al obtener platillos');

            const data = await res.json();

            if (Array.isArray(data)) {
                // Only show available platillos
                platillos = data.filter(p => p.disponible !== false);
            } else {
                platillos = [];
            }

            // Extract unique categories
            const catSet = new Map();
            platillos.forEach(p => {
                if (p.categoria && p.categoria._id) {
                    catSet.set(p.categoria._id, p.categoria.nombre);
                }
            });
            categorias = Array.from(catSet, ([id, nombre]) => ({ id, nombre }));

            renderCategoryFilters();
            renderMenu();
        } catch (err) {
            console.error(err);
            showAlert('Error al cargar el menú.');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  LOAD MESAS (only LIBRE)
    // ══════════════════════════════════════════════════════════
    const loadMesas = async () => {
        try {
            const res = await fetch('/mesas', { headers: getHeaders() });
            if (handleAuthError(res)) return;
            if (!res.ok) throw new Error('Error al obtener mesas');

            const data = await res.json();
            mesasLibres = Array.isArray(data) ? data.filter(m => m.estado === 'LIBRE') : [];

            renderMesaSelect();
        } catch (err) {
            console.error(err);
            showAlert('Error al cargar las mesas.');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  RENDER – Category pills
    // ══════════════════════════════════════════════════════════
    const renderCategoryFilters = () => {
        categoryFilters.innerHTML = '';

        // "All" pill
        const allPill = document.createElement('span');
        allPill.className = 'cat-pill' + (activeCategory === null ? ' active' : '');
        allPill.textContent = 'Todos';
        allPill.addEventListener('click', () => { activeCategory = null; renderCategoryFilters(); renderMenu(); });
        categoryFilters.appendChild(allPill);

        categorias.forEach(cat => {
            const pill = document.createElement('span');
            pill.className = 'cat-pill' + (activeCategory === cat.id ? ' active' : '');
            pill.textContent = cat.nombre;
            pill.addEventListener('click', () => { activeCategory = cat.id; renderCategoryFilters(); renderMenu(); });
            categoryFilters.appendChild(pill);
        });
    };

    // ══════════════════════════════════════════════════════════
    //  RENDER – Menu grid
    // ══════════════════════════════════════════════════════════
    const renderMenu = () => {
        menuGrid.innerHTML = '';

        const searchTerm = (searchInput.value || '').toLowerCase().trim();

        let filtered = platillos;

        // Category filter
        if (activeCategory) {
            filtered = filtered.filter(p => p.categoria && p.categoria._id === activeCategory);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchTerm));
        }

        if (filtered.length === 0) {
            menuGrid.innerHTML = `
                <div class="col-12 text-center py-5" style="color:rgba(255,255,255,.4)">
                    <i class="fas fa-search fa-3x mb-3 d-block"></i>
                    <p>No se encontraron platillos</p>
                </div>`;
            return;
        }

        filtered.forEach((p, idx) => {
            const col = document.createElement('div');
            col.className = 'col-sm-6 col-md-4 col-xl-3 plat-col';
            col.style.animationDelay = `${Math.min(idx * 0.04, 0.4)}s`;

            const catNombre = p.categoria ? p.categoria.nombre : '';
            const desc = p.descripcion || '';

            col.innerHTML = `
                <div class="platillo-card">
                    <div class="platillo-nombre">${p.nombre}</div>
                    ${catNombre ? `<small style="color:rgba(255,255,255,.4); font-size:.75rem;"><i class="fas fa-tag me-1"></i>${catNombre}</small>` : ''}
                    <div class="platillo-desc">${desc}</div>
                    <div class="platillo-precio">$${parseFloat(p.precio).toFixed(2)}</div>
                    <button class="btn btn-agregar btn-sm" data-id="${p._id}">
                        <i class="fas fa-plus me-1"></i>Agregar
                    </button>
                </div>`;

            // Click handler for the "Agregar" button
            col.querySelector('.btn-agregar').addEventListener('click', () => addToTicket(p));

            menuGrid.appendChild(col);
        });
    };

    // Search – re-render on input
    searchInput.addEventListener('input', () => renderMenu());

    // ══════════════════════════════════════════════════════════
    //  RENDER – Mesa <select>
    // ══════════════════════════════════════════════════════════
    const renderMesaSelect = () => {
        // Preserve current selection if still valid
        const currentVal = selectMesa.value;
        selectMesa.innerHTML = '<option value="">-- Elige una mesa --</option>';

        mesasLibres.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m._id;
            opt.textContent = `Mesa ${m.numero_mesa}  (${m.capacidad} pers.)`;
            selectMesa.appendChild(opt);
        });

        // Restore selection if still available
        if (currentVal && mesasLibres.some(m => m._id === currentVal)) {
            selectMesa.value = currentVal;
        }

        updateEnviarBtn();
    };

    // ══════════════════════════════════════════════════════════
    //  TICKET – Add / Remove / Qty
    // ══════════════════════════════════════════════════════════
    const addToTicket = (platillo) => {
        const existing = ticketItems.find(i => i.platilloId === platillo._id);
        if (existing) {
            existing.cantidad++;
        } else {
            ticketItems.push({
                platilloId: platillo._id,
                nombre: platillo.nombre,
                precio: platillo.precio,
                cantidad: 1
            });
        }
        renderTicket();
    };

    const removeFromTicket = (platilloId) => {
        ticketItems = ticketItems.filter(i => i.platilloId !== platilloId);
        renderTicket();
    };

    const changeQty = (platilloId, delta) => {
        const item = ticketItems.find(i => i.platilloId === platilloId);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad < 1) {
            removeFromTicket(platilloId);
            return;
        }
        renderTicket();
    };

    // ══════════════════════════════════════════════════════════
    //  RENDER – Ticket list & total
    // ══════════════════════════════════════════════════════════
    const renderTicket = () => {
        if (ticketItems.length === 0) {
            ticketItemsEl.innerHTML = `
                <div class="ticket-empty">
                    <i class="fas fa-shopping-basket d-block"></i>
                    <p class="mb-0">Agrega platillos del menú</p>
                </div>`;
            ticketTotalEl.textContent = '$0.00';
            updateEnviarBtn();
            return;
        }

        ticketItemsEl.innerHTML = '';
        let total = 0;

        ticketItems.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const row = document.createElement('div');
            row.className = 'ticket-item';
            row.innerHTML = `
                <div class="item-name">${item.nombre}</div>
                <div class="qty-controls">
                    <button class="btn-qty" data-action="minus" data-id="${item.platilloId}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-val">${item.cantidad}</span>
                    <button class="btn-qty" data-action="plus" data-id="${item.platilloId}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-price">$${subtotal.toFixed(2)}</div>
                <button class="btn-remove" data-id="${item.platilloId}" title="Quitar">
                    <i class="fas fa-times"></i>
                </button>`;

            // Event delegation for qty buttons
            row.querySelector('[data-action="minus"]').addEventListener('click', () => changeQty(item.platilloId, -1));
            row.querySelector('[data-action="plus"]').addEventListener('click', () => changeQty(item.platilloId, 1));
            row.querySelector('.btn-remove').addEventListener('click', () => removeFromTicket(item.platilloId));

            ticketItemsEl.appendChild(row);
        });

        ticketTotalEl.textContent = '$' + total.toFixed(2);
        updateEnviarBtn();
    };

    // ══════════════════════════════════════════════════════════
    //  Enable / Disable Enviar button
    // ══════════════════════════════════════════════════════════
    const updateEnviarBtn = () => {
        btnEnviar.disabled = !(ticketItems.length > 0 && selectMesa.value);
    };

    selectMesa.addEventListener('change', updateEnviarBtn);

    // ══════════════════════════════════════════════════════════
    //  SUBMIT ORDER – POST /pedidos
    // ══════════════════════════════════════════════════════════
    btnEnviar.addEventListener('click', async () => {
        // Final validations
        if (!selectMesa.value) {
            showAlert('Selecciona una mesa antes de enviar el pedido.', 'warning');
            return;
        }
        if (ticketItems.length === 0) {
            showAlert('Agrega al menos un platillo al ticket.', 'warning');
            return;
        }

        // Resolve mesero id – use logged-in user
        const meseroId = usuarioGuardado._id || usuarioGuardado.id;
        if (!meseroId) {
            showAlert('No se pudo identificar al mesero. Inicia sesión nuevamente.', 'danger');
            return;
        }

        // Build payload matching pedidoModel
        const payload = {
            mesero: meseroId,
            mesa: selectMesa.value,
            detalles: ticketItems.map(item => ({
                platillo: item.platilloId,
                cantidad: item.cantidad
            }))
        };

        // Disable button to prevent double-click
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';

        try {
            const res = await fetch('/pedidos', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (handleAuthError(res)) return;

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(ui.friendlyError(errData, 'No se pudo crear el pedido.'));
            }

            const data = await res.json();

            // Success!
            showAlert('¡Pedido enviado a cocina exitosamente!', 'success');

            // Clear ticket
            ticketItems = [];
            renderTicket();
            selectMesa.value = '';

            // Refresh mesas (the selected one is now OCUPADA)
            await loadMesas();

        } catch (err) {
            showAlert(ui.friendlyError({ error: err.message }, 'No se pudo crear el pedido.'), 'danger');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Confirmar y Enviar a Cocina';
            updateEnviarBtn();
        }
    });

    // ══════════════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════════════
    loadPlatillos();
    loadMesas();
});
