require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const { env } = require('process');
const responseJSON = require("./utils/responseJSON");

const app = express();

app.use(express.json());

//****** Model *****
const ratingSchema = new mongoose.Schema({
    count:{type: Number, required: true},
    rate:{type: Number, required: true},
});

const productSchema = new mongoose.Schema({
    title:{type: String, required: true},
    category:{type: String, required: true},
    price:{type: Number, required: true},
    image:{type: String, required: true},
    description:{type: String, required: true},
    rate:{type: String, required: true},
})

const Product = mongoose.model("Product", productSchema);


//***** Routes *****

app.get('/products',async (req,res)=> {
    try {
        const allProducts = await Product.find({});
        responseJSON(res,200,allProducts);
    } catch (e) {
        responseJSON(res,501,{Error: e});
        return;
    }
})


//Start action
mongoose.connect(env.URL,{useNewUrlParser: true, useUnifiedTopology: true});

app.listen(env.SERVER_PORT,()=>{
    console.log(`Server running at http://127.0.0.1:${env.SERVER_PORT}/`);
})