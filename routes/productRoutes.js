const express = require('express');
const { createProduct, getaProduct, getAllProduct, updateProduct,deleteProduct, addToWishlist, rating } = require('../controller/productController');
const router = express.Router();

const {isAdmin , authMiddleware} = require('../middleware/authMiddleware');

router.post('/' ,authMiddleware, isAdmin,createProduct);
router.get('/:id' , getaProduct);

router.put('/wishlist' , authMiddleware,addToWishlist);
router.put('/rating' , authMiddleware,rating);

router.put('/:id' ,authMiddleware,isAdmin, updateProduct);
router.get('/' ,authMiddleware,isAdmin,getAllProduct);
router.delete('/:id' , deleteProduct);


module.exports = router;