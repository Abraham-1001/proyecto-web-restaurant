window.ui = (() => {
    let modalElement;

    const ensureModal = () => {
        if (modalElement) return modalElement;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="modal fade" id="uiConfirmModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content bg-dark text-white border-secondary">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title" id="uiConfirmTitle">Confirmar acción</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body" id="uiConfirmMessage"></div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="uiConfirmAccept">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(wrapper.firstElementChild);
        modalElement = document.getElementById('uiConfirmModal');
        return modalElement;
    };

    const confirm = (message, title = 'Confirmar acción') => new Promise(resolve => {
        const modal = ensureModal();
        const instance = bootstrap.Modal.getOrCreateInstance(modal);
        modal.querySelector('#uiConfirmTitle').textContent = title;
        modal.querySelector('#uiConfirmMessage').textContent = message;
        const accept = modal.querySelector('#uiConfirmAccept');
        const finish = (value) => {
            accept.removeEventListener('click', acceptHandler);
            modal.removeEventListener('hidden.bs.modal', cancelHandler);
            resolve(value);
        };
        const acceptHandler = () => { instance.hide(); finish(true); };
        const cancelHandler = () => finish(false);
        accept.addEventListener('click', acceptHandler, { once: true });
        modal.addEventListener('hidden.bs.modal', cancelHandler, { once: true });
        instance.show();
    });

    const friendlyError = (data, fallback) => {
        const raw = data?.message || data?.error || '';
        if (/E11000|duplicate key|dup key/i.test(raw)) {
            if (/numero_mesa/i.test(raw)) return 'Ya existe una mesa con ese número.';
            if (/correo/i.test(raw)) return 'Ya existe un usuario registrado con ese correo.';
            if (/nombre/i.test(raw)) return 'Ya existe un registro con ese nombre.';
            return 'Ya existe un registro con esos datos. Verifica la información e inténtalo de nuevo.';
        }
        if (/Cast to ObjectId|validation failed|ValidationError/i.test(raw)) {
            return 'Los datos ingresados no son válidos. Revisa los campos e inténtalo de nuevo.';
        }
        return raw && !/Mongo|mongoose|at .*model| at /i.test(raw) ? raw : fallback;
    };

    return { confirm, friendlyError };
})();
