// src/services/catalog/routes/productOptionsRoutes.js
const express = require('express');
const router = express.Router();

// Importar controladores
const pizzaSizesController = require('../controllers/pizzaSizesController');
const pizzaCrustsController = require('../controllers/pizzaCrustsController');
const burgerAddonsController = require('../controllers/burgerAddonsController');

// Rotas para tamanhos de pizza
router.get('/pizza-sizes', pizzaSizesController.getAllSizes);
router.get('/pizza-sizes/:id', pizzaSizesController.getSizeById);
router.post('/pizza-sizes', pizzaSizesController.createSize);
router.put('/pizza-sizes/:id', pizzaSizesController.updateSize);
router.delete('/pizza-sizes/:id', pizzaSizesController.deleteSize);

// Rotas para bordas de pizza
router.get('/pizza-crusts', pizzaCrustsController.getAllCrusts);
router.get('/pizza-crusts/:id', pizzaCrustsController.getCrustById);
router.post('/pizza-crusts', pizzaCrustsController.createCrust);
router.put('/pizza-crusts/:id', pizzaCrustsController.updateCrust);
router.delete('/pizza-crusts/:id', pizzaCrustsController.deleteCrust);

// Rotas para adicionais de hambúrguer
router.get('/burger-addons', burgerAddonsController.getAllAddons);
router.get('/burger-addons/:id', burgerAddonsController.getAddonById);
router.post('/burger-addons', burgerAddonsController.createAddon);
router.put('/burger-addons/:id', burgerAddonsController.updateAddon);
router.delete('/burger-addons/:id', burgerAddonsController.deleteAddon);

module.exports = router;