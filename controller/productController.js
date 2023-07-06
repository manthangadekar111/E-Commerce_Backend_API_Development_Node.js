const Product  = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const { propfind } = require('../routes/productRoutes');
const User = require("../models/userModel");

//create product....
const createProduct = asyncHandler(async(req,res )=>{
   try{
    if(req.body.title){
        req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json({newProduct});
   }catch(error){
        throw new Error(error);
   }
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
  
      res.json(updatedProduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const deleteProduct = await Product.findByIdAndDelete(id);
      res.json(deleteProduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  


//get productc
// const getaProduct  = asyncHandler(async(req , res)=>{
//    const {id} = req.params;
//     try{
//         const findProduct = await Product.findById(id);
//         res.json(findProduct);
//     }catch(error){
//         throw new Error(error);
//     };
// });
//filtering product with sorting ,limiting
const getaProduct  = asyncHandler(async(req , res)=>{
  const {id} = req.params;
   try{
       const findProduct = await Product.findById(id);
       res.json(findProduct);
   }catch(error){
       throw new Error(error);
   };
});




// //getall product
// const getAllProduct = asyncHandler(async(req ,res)=>{
//     try{
//         const getAllproduct = await Product.find();
//         res.json(getAllproduct);
//     }catch(error){
//         throw new Error(error);
//     }
// })

// product filter , sorting
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));
    //sorting
    if(req.query.sort){
      const sortBy = req.query.sort.split(",").join(" ");
      query  = query.sort(sortBy);
    }else{
        query = query.sort("-createdAt");
    }

    //limiting the fiels
    if(req.query.fields){
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
    }else{
      query = query.select('-__v');
    }

    //pagination
    const page = req.query.page;
const limit = req.query.limit;
const skip = (page - 1) * limit; // Change the calculation of skip value
query = query.skip(skip).limit(limit);

if (req.query.page) {
  const productCount = await Product.countDocuments();
  if (skip >= productCount) throw new Error('This page does not exist');
}

console.log(page, limit, skip);
    const products = await query; // Rename 'Product' to 'products'
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

//product wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  
module.exports = {
    createProduct , getaProduct ,
     getAllProduct,updateProduct,deleteProduct,
     addToWishlist,rating
};