const Blog = require('../models/blogModel');
const User   =require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');
//create blog
const createBlog = asyncHandler(async(req , res)=>{
  console.log(req.body);
    try{
        const newblog = await Blog.create(req.body);
        res.json({newblog});
    }catch(error){
        throw new Error(error);
    }
});

// update blog
const updateBlog = asyncHandler(async(req , res)=>{
    const {id} = req.params;
    try{
        const updateBlog = await Blog.findByIdAndUpdate(id , req.body , {
            new  :true,
        });
        res.json({updateBlog});
    }catch(error){
        throw new Error(error);
    }
});

// fetch blog
const getBlog = asyncHandler(async(req , res)=>{
    const {id} = req.params;
    try{
        const getBlog = await Blog.findBy(id);
        const updateViews = await Blog.findByIdAndUpdate(
            id,{
                $inc:{numViews:1},
            },
            {new : true }
        );
        res.json({updateViews});
    }catch(error){
        throw new Error(error);
    }
});

//get all blog
const getAllBlogs = asyncHandler(async(req , res)=>{
    try{
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    }catch(error){
        throw new Error(error);
    }
})

//delete blog
const deleteBlog = asyncHandler(async(req , res)=>{ 
    const {id} = req.params;
    try{
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json({deleteBlog});
    }catch(error){
        throw new Error(error);
    }
});

const liketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    // find if the user has liked the blog
    const isLiked = blog?.isLiked;
    // find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  });


  const disliketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    // find if the user has liked the blog
    const isDisLiked = blog?.isDisliked;
    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isDisLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  });
module.exports = {createBlog,updateBlog,
  getBlog,getAllBlogs,deleteBlog,liketheBlog ,disliketheBlog 
};