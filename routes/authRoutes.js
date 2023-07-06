const express = require('express');
const { Model } = require('mongoose');
const { createUser, loginUserCtrl, getallUser,
     getUser, deleteaUser, updatedUser, blockUser, 
     unblockUser, handleRefreshToken, logout ,updatePassword, resetPassword, loginAdmin, saveAddress, userCart, getuserCart, createOrder, getOrders, updateOrderStatus}
      = require('../controller/userController');
const {authMiddleware , isAdmin} = require('../middleware/authMiddleware');
const router  = express.Router();


router.post('/register' , createUser);
router.post('/reset-password/:token' , resetPassword);
router.put('/password' , authMiddleware,updatePassword);
router.post('/login',loginUserCtrl);
router.put('order/update-order/:id' , authMiddleware , isAdmin , updateOrderStatus);

router.post('/admin-login' , loginAdmin);
router.post('/cart' , userCart);
router.post('/cart/cash-order' ,authMiddleware , createOrder);

router.get('/all-users' , getallUser);
router.get('/get-orders' , getOrders);
router.get('/refresh' , handleRefreshToken);
router.get('/logout' , logout);
router.get('/:id' ,authMiddleware , getUser);
router.delete('/:id',deleteaUser);
router.put('/edit-user' , authMiddleware, updatedUser);
router.put('/save-address' , authMiddleware,saveAddress);
router.put('/block-user/:id' , authMiddleware,isAdmin, blockUser);
router.put('/unblock-user/:id' , authMiddleware,isAdmin, unblockUser);
router.get('/cart' , authMiddleware , getuserCart);

module.exports  = router;