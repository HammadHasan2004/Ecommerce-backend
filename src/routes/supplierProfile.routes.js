import { Router } from "express";
import {
    createSupplierProfile,
    getSupplierProfile,
    getMySupplierProfile,
    updateSupplierProfile,
} from "../controller/supplierProfile.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifySupplier } from "../middleware/verifySupplier.middleware.js";

const router = Router();

// protected — sirf logged-in supplier apna profile check kare
router.route("/me").get(verifyJWT, verifySupplier, getMySupplierProfile);

// public — koi bhi kisi supplier ka profile dekh sake, ID se
router.route("/:id").get(getSupplierProfile);

// protected — profile create/update
router.route("/").post(verifyJWT, verifySupplier, createSupplierProfile);
router.route("/").patch(verifyJWT, verifySupplier, updateSupplierProfile);

export default router;