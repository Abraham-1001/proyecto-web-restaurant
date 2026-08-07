const express = require('express');
const router = express.Router();
const controllerCorte = require('../controllers/corteController');

router.post('/', controllerCorte.CrearCorte);
router.get('/', controllerCorte.ObtenerCortes);

module.exports = router;
