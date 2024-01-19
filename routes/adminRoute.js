const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

router.post('/admin/login', adminController.verifyAdmin);
router.get('/adminHome', adminController.renderAdminHome);
router.get('/admin/login', (req, res) => {
    res.render('adminLogin');
});
router.get('/admin/edit/:userId', adminController.renderEditUser);
router.post('/admin/edit/:userId', adminController.editUser);
router.post('/admin/block/:userId', adminController.toggleBlockUser);
router.get('/admin/createuser', adminController.renderCreateUser);
router.post('/admin/adduser', adminController.addUser);       
router.get('/admin/logout', adminController.logoutAdmin);                                                 

module.exports = router;