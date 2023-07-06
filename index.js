const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();

const { notfound, errorHandler } = require('./middleware/errorHandler');

const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const authRouter  = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const blogRouter = require('./routes/blogRoutes');
const categoryRouter = require('./routes/productcategoryRoutes');
const brandRouter = require('./routes/brandRoutes');

const cookieParser = require('cookie-parser');
//its give us exact time /url/path/api and all
const morgan = require('morgan');
const categoryModel = require('./models/productcategoryModel');
dbConnect();

// app.use("/",(req  ,res)=>{
//     res.send("Hello from server");
// })
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use("/api/user" , authRouter);
app.use("/api/product" , productRouter);
app.use("/api/blog" , blogRouter);
app.use("/api/category",categoryRouter);
app.use("/api/brand",brandRouter);


app.use(notfound);
app.use(errorHandler);




app.listen(PORT , ()=>{
    console.log("server is running on port" + PORT);
});

