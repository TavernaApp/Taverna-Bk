// routes/barRoutes.js
const express = require('express');
const router = express.Router();
const BarController = require('../controllers/BarController');

router.get('/bars', BarController.getBars);
router.get('/allgetbars', BarController.getAllBars); // This route is correctly defined

router.get('/bars/:id', BarController.getBarById);
router.post('/bars', BarController.createBar); // This route is correctly defined

router.put('/bars/:id', BarController.updateBar);
router.delete('/bars/:id', BarController.deleteBar);
module.exports = router;
