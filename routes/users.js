const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controllers/userController');

router.get('/create', userController.createGet);

router.post('/create', userController.createPost);

module.exports = router;
