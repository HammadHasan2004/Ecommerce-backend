// src/models/orderItem.model.js
import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);

