require("dotenv").config();
console.log(process.env.SERVER_PORT);
const PORT =
  typeof process.env.SERVER_PORT !== "undefined"
    ? process.env.SERVER_PORT
    : 8000;
const URL = process.env.URL;

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { env } = require("process");
const { productAllowedUpdates } = require("./constants/allowedUpdates");
const responseJSON = require("./utils/responseJSON");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("client/build"))

//****** Model *****
const ratingSchema = new mongoose.Schema({
  count: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: ratingSchema, required: true },
});

const Product = mongoose.model("Product", productSchema);

//***** Routes *****

app.get("/api/products", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    responseJSON(res, 200, allProducts);
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.get("/api/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findOne({ _id: productId });
    responseJSON(res, 200, product);
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.get("/api/products/category/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const products = await Product.find({ category });
    responseJSON(res, 200, products);
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = new Product({ ...req.body });
    // console.log(product);
    console.log("p", { ...req.body });
    await product.save();
    responseJSON(res, 200, product);
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.delete("/api/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findOneAndDelete({ _id: productId });
    responseJSON(res, 200, product);
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.put("/api/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const updates = Object.keys(req.body);
  const isValidOpertion = updates.every((update) => {
    if (typeof req.body[update] === "object") {
      const nestedUpdates = Object.keys(req.body[update]);
      console.log(update, req.body[update], nestedUpdates);
      return nestedUpdates.every(
        (nestedUpdate) => productAllowedUpdates[update][nestedUpdate]
      );
    }
    return productAllowedUpdates[update];
  });
  if (!isValidOpertion) {
    responseJSON(res, 400, { error: "Invalid updates", req: req.body });
    return;
  }
  try {
    const product = await Product.findOne({ _id: productId });
    console.log(123);
    if (!product) {
      responseJSON(res, 404, { error: "product not found" });
      return;
    }
    updates.forEach((update) => {
      if (typeof req.body[update] === "object") {
        const nestedUpdates = Object.keys(req.body[update]);
        nestedUpdates.forEach((nestedUpdate) => {
          product[update][nestedUpdate] = req.body[update][nestedUpdate];
        });
      } else {
        product[update] = req.body[update];
      }
    });
    await product.save();
    responseJSON(res, 200, product);
    return;
  } catch (e) {
    responseJSON(res, 501, { error: e });
    return;
  }
});

app.get("*", (req, res) => {
  console.log(req.url);
  // if (req.url === "/") {
    res.sendFile(__dirname + "/client/build/index.html");
  // } else {
  //   res.sendFile(__dirname + "/client/build/" + req.url);

  // }
});

//Start action
mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
