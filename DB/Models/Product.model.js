import mongoose, { model } from "mongoose";

const ProductSchema = new mongoose.Schema({
  CategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  CategoryName: {
    type: String,
    ref: "Category",
  },
  ProductName: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
  },
  Stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  ImageUrl: {
        secure_url: { type: String },
        public_id: { type: String }
  },
  Brand: {
    type: String,
    default: "Wyze",
  },
  ColorName: { type: String },
  ColorHex: { type: String },
  BasePrice: {
    type: Number,
    required: true,
  },
  HasOffer: {
    type: Boolean,
    default:false
   
  },
  TotalOffer: {
    type: Number,
    default:0
  },
  PriceAfterOffer: {
    type: Number,
    default:0
  },
  HasVariants: {
    type: Boolean,
    default: false,
  },
  stock: { type: Number, required: true, default: 0 },
  Variants: [
    {
      ColorName: { type: String },
      ColorHex: { type: String },
      sku: { type: String },
      ImageUrl: {
        secure_url: { type: String },
        public_id: { type: String }
       }
    },
  ],
});

ProductSchema.index({ ProductName: "text" });

const ProductModel = model("Product", ProductSchema);

export default ProductModel;