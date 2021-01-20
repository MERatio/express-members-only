const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controllers/userController');

router.get('/sign-up', userController.createGet);

router.post('/sign-up', userController.createPost);

router.get('/log-in', userController.logInGet);

router.post('/log-in', userController.logInPost);

router.get('/log-out', userController.logOut);

router.get('/join-club', userController.joinClubGet);

router.post('/join-club', userController.joinClubPost);

module.exports = router;
