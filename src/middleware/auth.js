const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function authenticate(req, res, next) {
    const authorization = req.get('Authorization') || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Se requiere un token de autenticación.' });
    }

    try {
        req.usuario = jwt.verify(token, jwtSecret);
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'El token es inválido o ha expirado.' });
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }
        return next();
    };
}

module.exports = {
    authenticate,
    authorizeRoles
};
