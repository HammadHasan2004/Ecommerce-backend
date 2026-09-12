// controller/category.controller.js
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../model/category.model.js";

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

export { getAllCategories };