(function () {
    function getSession() {
        return {
            token: localStorage.getItem('token'),
            usuario: JSON.parse(localStorage.getItem('usuario') || '{}')
        };
    }

    function requireSession() {
        if (!getSession().token) {
            window.location.replace('/index.html');
        }
    }

    window.cerrarSesion = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.replace('/index.html');
    };

    window.addEventListener('pageshow', requireSession);
    requireSession();
})();