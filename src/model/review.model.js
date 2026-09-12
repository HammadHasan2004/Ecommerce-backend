import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        supplier: {
            type: Schema.Types.ObjectId,
            ref: "SupplierProfile",
            required: true,
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
        },
        order: { 
            type: Schema.Types.ObjectId, 
            ref: "Order", 
            required: true 
        }
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);