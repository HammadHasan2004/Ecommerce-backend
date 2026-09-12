import { Router } from "express";
import { createReview, getSupplierReviews } from "../controller/review.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// public — koi bhi supplier ke reviews dekh sake
router.route("/:supplierId").get(getSupplierReviews);

// protected — sirf logged-in user review de sake
router.route("/:supplierId").post(verifyJWT, createReview);

export default router;