const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controllers/userController');

router.get('/create', userController.createGet);

router.post('/create', userController.createPost);

router.get('/log-in', userController.logInGet);

router.post('/log-in', userController.logInPost);

router.get('/log-out', userController.logOut);

module.exports = router;
