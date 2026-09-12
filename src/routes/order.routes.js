import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} from "../controller/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifySupplier } from "../middleware/verifySupplier.middleware.js";

const router = Router();

// sab routes protected hain — order dena/dekhna sirf logged-in users kar sakte hain
router.route("/").post(verifyJWT, createOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/:id").get(verifyJWT, getOrderById);


router.route("/:id/status").patch(verifyJWT, verifySupplier, updateOrderStatus);
router.route("/:id/cancel").patch(verifyJWT, cancelOrder);

export default router;