import { Router } from "express";
import { getSupplierDashboard } from "../controller/analytics.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifySupplier } from "../middleware/verifySupplier.middleware.js";

const router = Router();

router.route("/dashboard").get(verifyJWT, verifySupplier, getSupplierDashboard);

export default router;