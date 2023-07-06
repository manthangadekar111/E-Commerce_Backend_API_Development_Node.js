const { generateToken } = require('../config/jwtToken');
const {generateRefreshToken} = require('../config/refreshToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

const validateMongoDbId = require('../utils/validateMongodbid');

const jwt = require('jsonwebtoken');
const createUser = asyncHandler(async(req, res)=>{
    const email = req.body.email;
    const findUser = await User.findOne({email:email});
    if(!findUser){
        const newUser =  await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error("User Already Exists");
    }
});

//user login
const loginUserCtrl = asyncHandler(async(req, res)=>{
    const {email , password} = req.body;
    // console.log(email , password);
    const findUser = await User.findOne({email});
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken  = await generateRefreshToken(findUser?._id);
        const updateuser =await User.findByIdAndUpdate(findUser.id , {
            refreshToken:refreshToken,
        },{
            new : true
        });
        res.cookie('refreshToken', refreshToken ,{
            httpOnly:true,
            maxAge:72*60*60*1000,
        });

        res.json({
            _id :findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email:findUser?.email,
            mobile:findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }else{
        throw new Error ("Invalid Credentials");
    }
});


//admin login
const loginAdmin = asyncHandler(async(req, res)=>{
    const {email , password} = req.body;
    // console.log(email , password);
    const findadmin = await User.findOne({email});
    if(findadmin.role!=='admin') throw new Error("Not Authorised");
    if(findadmin && (await findadmin.isPasswordMatched(password))){
        const refreshToken  = await generateRefreshToken(findadmin?._id);
        const updateuser =await User.findByIdAndUpdate(findadmin.id , {
            refreshToken:refreshToken,
        },{
            new : true
        });
        res.cookie('refreshToken', refreshToken ,{
            httpOnly:true,
            maxAge:72*60*60*1000,
        });

        res.json({
            _id :findadmin?._id,
            firstname: findadmin?.firstname,
            lastname: findadmin?.lastname,
            email:findadmin?.email,
            mobile:findadmin?.mobile,
            token: generateToken(findadmin?._id),
        });
    }else{
        throw new Error ("Invalid Credentials");
    }
});

//save address
const saveAddress = asyncHandler(async(req , res,next)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id,{
            address:req?.body?.address,
        },{
            new :true,
        });
        res.json(updateUser);
    }catch(error){
        throw new Error(error);
    }
});


//get all users
const getallUser = asyncHandler(async (req , res)=>{
    try{
        const getUsers = await User.find();
        res.json(getUsers);
    }catch(error){
        throw new Error(error);
    }
});

//get a single user
const getUser = asyncHandler(async(req  ,res)=>{
    console.log(req.params);
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    }catch(error){
        throw new Error(error);
    }
});

//delete a user
const deleteaUser = asyncHandler(async(req  ,res)=>{
    // console.log(req.params);
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        });
    }catch(error){
        throw new Error(error);
    }
});

//handle refresh token
const handleRefreshToken = asyncHandler(async(req , res)=>{
    const cookie = req.cookies;
    // console.log(cookie);
    if(!cookie?.refreshToken) throw new Error ("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error ("No Refresh token present in db or not matched..");
    jwt.verify(refreshToken , process.env.JWT_SECRET , (err ,decoded)=>{
        if(err|| user.id!== decoded.id){
            throw new Error("there is something wrong with refresh token ");
        }
        const accessToken = generateToken(user?.id);
        res.json(accessToken);

    })
});

//user logout
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate(
      { refreshToken: refreshToken }, // Use an object as the filter
      {
        refreshToken: "",
      }
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  });
  

//update user
const updatedUser = asyncHandler(async(req , res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(_id , {
            firstname : req?.body?.firstname,
            lastname : req?.body?.lastname,
            email:req?.body?.email,
            mobile:req?.body?.mobile,
        }, 
        {
            new:true,
        }
    );
        res.json(updatedUser);
    }catch(error){
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async(req,res)=>{
    const{id} = req.params;
    validateMongoDbId(id);
    try{
        const block = await User.findByIdAndUpdate(id,{
            isBlocked:true
        },
        {
            new:true,
        });
        res.json({
            message:"user blocked.."
        });
    }catch(error){
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async(req,res)=>{
    const{id} = req.params;
    validateMongoDbId(id);
    try{
        const unblock = await User.findByIdAndUpdate(id,{
            isBlocked:false
        },
        {
            new:true,
        });
        res.json({
            message:"user unblocked.."
        });
    }catch(error){
        throw new Error(error);
    }
});


//change password..
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body; // Destructure password from req.body
    validateMongoDbId(_id);
    const user = await User.findById(_id);
  
    if (password) {
      user.password = password; // Assign the password as a string
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });
  
//reset password
const resetPassword = asyncHandler(async(req ,res)=>{
    const{ password } = req.body;
    const {token} = req.params;
    const hashedToken =  crypto.create("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now() },
    });
    if(!user) throw new Error("Token expired try gain later...");
    user.password = password;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    res.json(user);
});

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      let products = [];
      const user = await User.findById(_id);
      // check if user already have product in cart
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        alreadyExistCart.remove();
      }
      for (let i = 0; i < cart.length; i++) {
        let object = {};
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;
        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.json(newCart);
    } catch (error) {
      throw new Error(error);
    }
  });

  const getuserCart = asyncHandler(async(req ,res)=>{
    const {_id } = req.user;
    validateMongoDbId(_id);
    try{
        const cart = await Cart.findOne({orderby:_id}).populate(
            "products.product"
        );
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
  });

  const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById(_id);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
  }); 
  
  const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const userorders = await Order.findOne({ orderby: _id })
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(updateOrderStatus);
    } catch (error) {
      throw new Error(error);
    }
  });

  


module.exports = {createUser , loginUserCtrl , getallUser, getUser , 
    deleteaUser , updatedUser , blockUser,unblockUser , handleRefreshToken,
    logout,updatePassword ,resetPassword,loginAdmin,saveAddress,userCart,
    getuserCart,createOrder,getOrders,updateOrderStatus};