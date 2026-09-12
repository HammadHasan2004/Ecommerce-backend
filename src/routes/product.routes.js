import { Router } from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controller/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifySupplier } from "../middleware/verifySupplier.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// public
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

// protected — supplier only
router.route("/").post(verifyJWT, verifySupplier, upload.single("image"), createProduct);
router.route("/:id").patch(verifyJWT, verifySupplier, updateProduct);
router.route("/:id").delete(verifyJWT, verifySupplier, deleteProduct);

export default router;