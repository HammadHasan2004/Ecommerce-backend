// route/category.routes.js
import { Router } from "express";
import { getAllCategories } from "../controller/category.controller.js";

const router = Router();
router.route("/").get(getAllCategories);

export default router;