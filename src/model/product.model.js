// src/models/product.model.js
import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "SupplierProfile",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["meter", "kg", "dozen", "carton", "sq.ft", "gross", "piece"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrder: {
      type: Number,

      required: true,
      min: 1,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);