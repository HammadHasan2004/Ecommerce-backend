// src/models/supplierProfile.model.js
import mongoose, { Schema } from "mongoose";

const supplierProfileSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    market: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    since: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const SupplierProfile = mongoose.model(
  "SupplierProfile",
  supplierProfileSchema
);