const express = require('express');
const router = express.Router();
const controllerCorte = require('../controllers/corteController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('CAJERO', 'ADMIN'));

router.post('/', controllerCorte.CrearCorte);
router.get('/', controllerCorte.ObtenerCortes);

module.exports = router;
