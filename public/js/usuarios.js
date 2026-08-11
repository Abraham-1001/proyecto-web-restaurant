document.addEventListener('DOMContentLoaded', () => {
    const tableBody      = document.querySelector('#tablaUsuarios tbody');
    const modalUsuario   = new bootstrap.Modal(document.getElementById('modalUsuario'));
    const formUsuario    = document.getElementById('formUsuario');
    const btnNuevo       = document.getElementById('btnNuevoUsuario');
    const btnGuardar     = document.getElementById('btnGuardarUsuario');
    const alertUsuarios  = document.getElementById('alertUsuarios');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput  = document.getElementById('password');
    const passwordHelp   = document.getElementById('passwordHelp');
    const labelPassword  = document.getElementById('labelPassword');

    // ── Helpers ─────────────────────────────────────────────
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const showAlert = (msg, type = 'danger') => {
        alertUsuarios.textContent = msg;
        alertUsuarios.className = `alert alert-${type}`;
        alertUsuarios.classList.remove('d-none');
        setTimeout(() => alertUsuarios.classList.add('d-none'), 5000);
    };

    const parseErrorResponse = async (res) => {
        try {
            return await res.json();
        } catch {
            return { error: res.statusText || 'Error de servidor' };
        }
    };

    const usuarioFormSchema = {
        nombre: { type: 'string', required: true, minLength: 2 },
        correo: { type: 'email', required: true },
        rol: { type: 'string', required: true },
        telefono: { type: 'string', pattern: '^\\+?[0-9\s\-()]{7,20}$', message: 'Ingresa un teléfono válido (solo dígitos, espacios, guiones, paréntesis y +).' },
        password: { type: 'string', minLength: 6 }
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

    // Role badge helper
    const rolBadge = (rol) => {
        const map = {
            'ADMIN':  { cls: 'badge-admin',  icon: 'fa-user-shield', label: 'Admin' },
            'MESERO': { cls: 'badge-mesero',  icon: 'fa-concierge-bell', label: 'Mesero' },
            'CAJERO': { cls: 'badge-cajero',  icon: 'fa-cash-register', label: 'Cajero' }
        };
        const info = map[rol] || { cls: 'bg-secondary', icon: 'fa-user', label: rol };
        return `<span class="badge badge-rol ${info.cls}"><i class="fas ${info.icon} me-1"></i>${info.label}</span>`;
    };

    const estadoBadge = (activo) => {
        return activo
            ? '<span class="badge badge-rol badge-activo"><i class="fas fa-check me-1"></i>Activo</span>'
            : '<span class="badge badge-rol badge-inactivo"><i class="fas fa-times me-1"></i>Inactivo</span>';
    };

    // Password visibility toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // ══════════════════════════════════════════════════════════
    //  LOAD USERS
    // ══════════════════════════════════════════════════════════
    const loadUsuarios = async () => {
        try {
            const res = await fetch('/usuarios', { headers: getHeaders() });
            if (handleAuthError(res)) return;
            if (!res.ok) throw new Error('Error al obtener usuarios');

            const data = await res.json();
            tableBody.innerHTML = '';

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(u => {
                    const nombreCompleto = u.apellido ? `${u.nombre} ${u.apellido}` : u.nombre;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle d-flex align-items-center justify-content-center me-2"
                                     style="width:34px; height:34px; background:rgba(255,255,255,.1); font-weight:600; font-size:.85rem;">
                                    ${u.nombre.charAt(0).toUpperCase()}${(u.apellido || '').charAt(0).toUpperCase()}
                                </div>
                                <span>${nombreCompleto}</span>
                            </div>
                        </td>
                        <td>${u.correo}</td>
                        <td>${u.telefono || '—'}</td>
                        <td>${rolBadge(u.rol)}</td>
                        <td>${estadoBadge(u.estado)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-light me-1" onclick="editarUsuario('${u._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${u._id}', '${nombreCompleto.replace(/'/g, "\\'")}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>`;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
            }
        } catch (err) {
            console.error(err);
            showAlert('Ocurrió un error al cargar los usuarios.');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  OPEN MODAL – New
    // ══════════════════════════════════════════════════════════
    btnNuevo.addEventListener('click', () => {
        formUsuario.reset();
        document.getElementById('usuarioId').value = '';
        document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
        document.getElementById('estado').checked = true;

        // Password is required for new users
        passwordInput.required = true;
        labelPassword.innerHTML = 'Contraseña <span class="text-danger">*</span>';
        passwordHelp.textContent = '';

        modalUsuario.show();
    });

    // ══════════════════════════════════════════════════════════
    //  SAVE / UPDATE
    // ══════════════════════════════════════════════════════════
    btnGuardar.addEventListener('click', async () => {
        const id = document.getElementById('usuarioId').value;
        const nombre   = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo   = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;
        const telefono = document.getElementById('telefono').value.trim();
        const rol      = document.getElementById('rol').value;
        const estado   = document.getElementById('estado').checked;

        const validationErrors = formValidators.validateForm({ nombre, correo, rol, password, telefono }, usuarioFormSchema);
        if (validationErrors.length) {
            showAlert(validationErrors[0].message, 'warning');
            return;
        }

        // Password required only for new users
        if (!id && !password) {
            showAlert('La contraseña es obligatoria para nuevos usuarios.', 'warning');
            return;
        }

        // Build body
        const bodyData = { nombre, correo, rol, estado };
        if (apellido) bodyData.apellido = apellido;
        if (telefono) bodyData.telefono = telefono;

        // Only include password if provided (for edits, empty means "don't change")
        if (password) {
            bodyData.password = password;
        }

        const method = id ? 'PUT' : 'POST';
        const url    = id ? `/usuarios/_id/${id}` : '/usuarios';

        try {
            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(bodyData)
            });

            if (!res.ok) {
                const errData = await parseErrorResponse(res);
                throw new Error(ui.friendlyError(errData, 'No se pudo guardar el usuario.'));
            }

            modalUsuario.hide();
            showAlert(id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 'success');
            loadUsuarios();
        } catch (err) {
            modalUsuario.hide();
            showAlert(ui.friendlyError({ error: err.message }, 'No se pudo guardar el usuario.'), 'danger');
        }
    });

    // ══════════════════════════════════════════════════════════
    //  EDIT (Global)
    // ══════════════════════════════════════════════════════════
    window.editarUsuario = async (id) => {
        try {
            const res = await fetch(`/usuarios/_id/${id}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('No se pudo cargar el usuario');

            const data = await res.json();
            const u = data.usuario;

            document.getElementById('usuarioId').value = u._id;
            document.getElementById('nombre').value    = u.nombre;
            document.getElementById('apellido').value  = u.apellido || '';
            document.getElementById('correo').value    = u.correo;
            document.getElementById('telefono').value  = u.telefono || '';
            document.getElementById('rol').value       = u.rol;
            document.getElementById('estado').checked  = u.estado;

            // Password is optional when editing
            passwordInput.value    = '';
            passwordInput.required = false;
            labelPassword.innerHTML = 'Contraseña <small class="text-muted" style="color:rgba(255,255,255,.4)!important;">(opcional)</small>';
            passwordHelp.textContent = 'Deja vacío para mantener la contraseña actual.';

            document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
            modalUsuario.show();
        } catch (err) {
            showAlert(ui.friendlyError({ error: err.message }, 'No se pudo cargar el usuario.'), 'danger');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  DELETE (Global)
    // ══════════════════════════════════════════════════════════
    window.eliminarUsuario = async (id, nombre) => {
        if (!await ui.confirm(`¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`, 'Eliminar usuario')) return;

        try {
            const res = await fetch(`/usuarios/_id/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(ui.friendlyError(errData, 'No se pudo eliminar el usuario.'));
            }

            showAlert('Usuario eliminado correctamente', 'success');
            loadUsuarios();
        } catch (err) {
            showAlert(ui.friendlyError({ error: err.message }, 'No se pudo eliminar el usuario.'), 'danger');
        }
    };

    // ══════════════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════════════
    loadUsuarios();
});
