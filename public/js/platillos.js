document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#tablaPlatillos tbody');
    const modalPlatillo = new bootstrap.Modal(document.getElementById('modalPlatillo'));
    const formPlatillo = document.getElementById('formPlatillo');
    const btnNuevo = document.getElementById('btnNuevoPlatillo');
    const btnGuardar = document.getElementById('btnGuardar');
    const alertPlatillos = document.getElementById('alertPlatillos');
    
    // API headers generator
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const showAlert = (msg, type = 'danger') => {
        alertPlatillos.textContent = msg;
        alertPlatillos.className = `alert alert-${type}`;
        alertPlatillos.classList.remove('d-none');
        setTimeout(() => alertPlatillos.classList.add('d-none'), 5000);
    };

    // Load Categorías
    const loadCategorias = async () => {
        try {
            const res = await fetch('/categorias', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error al obtener categorías');
            const categorias = await res.json();
            const select = document.getElementById('categoria');
            
            // clear options
            select.innerHTML = '<option value="">Seleccione una categoría...</option>';
            if(Array.isArray(categorias)) {
                categorias.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat._id;
                    opt.textContent = cat.nombre;
                    select.appendChild(opt);
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Load Platillos
    const loadPlatillos = async () => {
        try {
            const res = await fetch('/platillos', { headers: getHeaders() });
            
            // Validar token si aplica el middleware, aquí capturamos 401 o 403
            if (res.status === 401 || res.status === 403) {
                showAlert('Tu sesión ha expirado o es inválida.', 'warning');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/index.html';
                }, 2000);
                return;
            }
            if (!res.ok) throw new Error('Error al obtener los platillos');
            
            const data = await res.json();
            tableBody.innerHTML = '';
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(platillo => {
                    const row = document.createElement('tr');
                    const catNombre = platillo.categoria ? platillo.categoria.nombre : 'Sin Categoría';
                    const estadoText = platillo.disponible ? '<span class="badge bg-success">Disponible</span>' : '<span class="badge bg-danger">Agotado</span>';
                    
                    row.innerHTML = `
                        <td>${platillo.nombre}</td>
                        <td>${catNombre}</td>
                        <td>$${parseFloat(platillo.precio).toFixed(2)}</td>
                        <td>${platillo.descripcion || ''}</td>
                        <td>${estadoText}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-light me-1" onclick="editarPlatillo('${platillo._id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarPlatillo('${platillo._id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay platillos registrados</td></tr>';
            }
        } catch (error) {
            console.error(error);
            showAlert('Ocurrió un error al cargar la información.');
        }
    };

    // Open New Modal
    btnNuevo.addEventListener('click', () => {
        formPlatillo.reset();
        document.getElementById('platilloId').value = '';
        document.getElementById('modalTitle').textContent = 'Nuevo Platillo';
        modalPlatillo.show();
    });

    // Save or Edit
    btnGuardar.addEventListener('click', async () => {
        const id = document.getElementById('platilloId').value;
        const bodyData = {
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            descripcion: document.getElementById('descripcion').value,
            disponible: document.getElementById('disponible').checked
        };

        if (!bodyData.nombre || !bodyData.categoria || isNaN(bodyData.precio)) {
            showAlert('Faltan datos obligatorios.', 'warning');
            modalPlatillo.hide();
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/platillos/_id/${id}` : '/platillos';

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

            modalPlatillo.hide();
            showAlert(id ? 'Platillo actualizado exitosamente' : 'Platillo creado exitosamente', 'success');
            loadPlatillos();
        } catch (error) {
            modalPlatillo.hide();
            showAlert(error.message, 'danger');
        }
    });

    // Edit (Global Window Function)
    window.editarPlatillo = async (id) => {
        try {
            const res = await fetch(`/platillos/_id/${id}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('No se pudo cargar el platillo');
            
            const data = await res.json();
            const p = data.platillo;
            
            document.getElementById('platilloId').value = p._id;
            document.getElementById('nombre').value = p.nombre;
            // Populating the select field correctly even if populated with object
            document.getElementById('categoria').value = p.categoria._id ? p.categoria._id : p.categoria;
            document.getElementById('precio').value = p.precio;
            document.getElementById('descripcion').value = p.descripcion || '';
            document.getElementById('disponible').checked = p.disponible;
            
            document.getElementById('modalTitle').textContent = 'Editar Platillo';
            modalPlatillo.show();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    // Delete (Global Window Function)
    window.eliminarPlatillo = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este platillo?')) return;
        
        try {
            const res = await fetch(`/platillos/_id/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Error al eliminar');
            }

            showAlert('Platillo eliminado correctamente', 'success');
            loadPlatillos();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    // Initialize
    loadCategorias();
    loadPlatillos();
});
