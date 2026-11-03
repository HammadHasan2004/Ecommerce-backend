// src/models/order.model.js
import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);