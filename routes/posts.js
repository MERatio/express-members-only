const express = require('express');
const router = express.Router();

// Controller
const postController = require('../controllers/postController');

router.get('/', postController.list);

router.get('/create', postController.createGet);

router.post('/create', postController.createPost);

module.exports = router;
