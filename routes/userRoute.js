const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/login', userController.renderLoginPage);
router.get('/signup', userController.renderSignupPage);
router.post('/login', userController.verifyUser);
router.post('/signup', userController.insertUser);
router.get('/userHome', userController.renderUserHome);
router.post('/logout', userController.logoutUser);

module.exports = router;
