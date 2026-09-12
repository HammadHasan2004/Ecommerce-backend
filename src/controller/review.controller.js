import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../model/review.model.js";
import { SupplierProfile } from "../model/supplierProfile.model.js";
import { Order } from "../model/order.model.js";

const createReview = asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    const { orderId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // confirm karo yeh order isi buyer ka hai
    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only review your own orders");
    }

    // confirm karo order "delivered" ho chuki hai (review sirf poore hue order pe ho)
    if (order.status !== "delivered") {
        throw new ApiError(400, "You can only review delivered orders");
    }

    // ab check "order" pe hai, "supplier" pe nahi
    const existingReview = await Review.findOne({ order: orderId, buyer: req.user._id });
    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this order");
    }

    const review = await Review.create({
        supplier: supplierId,
        buyer: req.user._id,

        order: orderId,
        rating,
        comment,
    });

    // supplier ki cached rating update (same as pehle)
    const allReviews = await Review.find({ supplier: supplierId });
    const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    const supplier = await SupplierProfile.findById(supplierId);
    supplier.averageRating = Number(newAverage.toFixed(1));
    supplier.totalReviews = allReviews.length;
    await supplier.save();

    return res.status(201).json(
        new ApiResponse(201, review, "Review added successfully")
    );
});

//seeing suppliers review
const getSupplierReviews = asyncHandler(async (req, res) => {
    const { supplierId } = req.params;

    const reviews = await Review.find({ supplier: supplierId })
        .populate("buyer", "username fullname")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, reviews, "Reviews fetched successfully")
    );
});

export { createReview, getSupplierReviews };

