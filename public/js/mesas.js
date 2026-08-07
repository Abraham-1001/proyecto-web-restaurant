document.addEventListener('DOMContentLoaded', () => {
    const mesasGrid = document.getElementById('mesasGrid');
    const modalMesa = new bootstrap.Modal(document.getElementById('modalMesa'));
    const formMesa = document.getElementById('formMesa');
    const btnNueva = document.getElementById('btnNuevaMesa');
    const btnGuardar = document.getElementById('btnGuardarMesa');
    const alertMesas = document.getElementById('alertMesas');

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = (usuario.rol || '').toUpperCase();

    if (rol === 'MESERO') {
        if (btnNueva) btnNueva.style.display = 'none';
    }

    // API headers generator
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Show alert
    const showAlert = (msg, type = 'danger') => {
        alertMesas.textContent = msg;
        alertMesas.className = `alert alert-${type}`;
        alertMesas.classList.remove('d-none');
        setTimeout(() => alertMesas.classList.add('d-none'), 5000);
    };

    // Badge helper
    const getBadge = (estado) => {
        const map = {
            'LIBRE':     { cls: 'badge-libre',     text: 'Libre' },
            'OCUPADA':   { cls: 'badge-ocupada',   text: 'Ocupada' },
            'RESERVADA': { cls: 'badge-reservada', text: 'Reservada' }
        };
        const info = map[estado] || map['LIBRE'];
        return `<span class="badge badge-estado ${info.cls}">${info.text}</span>`;
    };

    // Card CSS class for top-bar color
    const getCardClass = (estado) => {
        const map = {
            'LIBRE': 'estado-libre',
            'OCUPADA': 'estado-ocupada',
            'RESERVADA': 'estado-reservada'
        };
        return map[estado] || 'estado-libre';
    };

    // ── Load Mesas ─────────────────────────────────────────────
    const loadMesas = async () => {
        try {
            const res = await fetch('/mesas', { headers: getHeaders() });

            if (res.status === 401 || res.status === 403) {
                showAlert('Tu sesión ha expirado o es inválida.', 'warning');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/index.html';
                }, 2000);
                return;
            }
            if (!res.ok) throw new Error('Error al obtener las mesas');

            const data = await res.json();
            mesasGrid.innerHTML = '';

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(mesa => {
                    const col = document.createElement('div');
                    col.className = 'col-sm-6 col-md-4 col-lg-3 mesa-card-wrapper';
                    col.innerHTML = `
                        <div class="mesa-card ${getCardClass(mesa.estado)}">
                            <div class="text-center">
                                <i class="fas fa-chair mesa-icon"></i>
                                <div class="mesa-numero">Mesa ${mesa.numero_mesa}</div>
                                <div class="mesa-capacidad"><i class="fas fa-users me-1"></i>${mesa.capacidad} personas</div>
                                <div class="mt-2">${getBadge(mesa.estado)}</div>
                            </div>
                            ${rol !== 'MESERO' ? `
                            <div class="mesa-actions">
                                <button class="btn btn-sm btn-outline-light" onclick="editarMesa('${mesa._id}')">
                                    <i class="fas fa-edit me-1"></i>Editar
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="eliminarMesa('${mesa._id}')">
                                    <i class="fas fa-trash me-1"></i>Eliminar
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    mesasGrid.appendChild(col);
                });
            } else {
                mesasGrid.innerHTML = `
                    <div class="col-12 empty-state">
                        <i class="fas fa-chair d-block"></i>
                        <h5>No hay mesas registradas</h5>
                        <p>Haz clic en "+ Nueva Mesa" para agregar la primera.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error(error);
            showAlert('Ocurrió un error al cargar las mesas.');
        }
    };

    // ── Open New Modal ─────────────────────────────────────────
    btnNueva.addEventListener('click', () => {
        formMesa.reset();
        document.getElementById('mesaId').value = '';
        document.getElementById('modalMesaTitle').textContent = 'Nueva Mesa';
        modalMesa.show();
    });

    // ── Save or Edit ───────────────────────────────────────────
    btnGuardar.addEventListener('click', async () => {
        const id = document.getElementById('mesaId').value;
        const bodyData = {
            numero_mesa: parseInt(document.getElementById('numero_mesa').value),
            capacidad: parseInt(document.getElementById('capacidad').value),
            estado: document.getElementById('estado').value
        };

        // Validations
        if (!bodyData.numero_mesa || bodyData.numero_mesa < 1) {
            showAlert('El número de mesa es obligatorio y debe ser mayor a 0.', 'warning');
            return;
        }
        if (!bodyData.capacidad || bodyData.capacidad < 1) {
            showAlert('La capacidad es obligatoria y debe ser mayor a 0.', 'warning');
            return;
        }
        if (!bodyData.estado) {
            showAlert('Debes seleccionar un estado para la mesa.', 'warning');
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/mesas/_id/${id}` : '/mesas';

        try {
            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(bodyData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || errData.error || 'Error en la petición');
            }

            modalMesa.hide();
            showAlert(id ? 'Mesa actualizada exitosamente' : 'Mesa creada exitosamente', 'success');
            loadMesas();
        } catch (error) {
            modalMesa.hide();
            showAlert(error.message, 'danger');
        }
    });

    // ── Edit (Global Window Function) ──────────────────────────
    window.editarMesa = async (id) => {
        try {
            const res = await fetch(`/mesas/_id/${id}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('No se pudo cargar la mesa');

            const data = await res.json();
            const m = data.mesa;

            document.getElementById('mesaId').value = m._id;
            document.getElementById('numero_mesa').value = m.numero_mesa;
            document.getElementById('capacidad').value = m.capacidad;
            document.getElementById('estado').value = m.estado;

            document.getElementById('modalMesaTitle').textContent = 'Editar Mesa';
            modalMesa.show();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    // ── Delete (Global Window Function) ────────────────────────
    window.eliminarMesa = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta mesa?')) return;

        try {
            const res = await fetch(`/mesas/_id/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Error al eliminar');
            }

            showAlert('Mesa eliminada correctamente', 'success');
            loadMesas();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    // ── Initialize ─────────────────────────────────────────────
    loadMesas();
});
