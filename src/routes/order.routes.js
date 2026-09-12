import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controller/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// sab routes protected hain — order dena/dekhna sirf logged-in users kar sakte hain
router.route("/").post(verifyJWT, createOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/:id").get(verifyJWT, getOrderById);

export default router;