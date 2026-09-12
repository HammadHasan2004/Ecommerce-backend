import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../model/product.model.js";
import { SupplierProfile } from "../model/supplierProfile.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, category, unit, price, minOrder, stock } = req.body;

    if ([name, category, unit, price, minOrder].some((field) => !field || field === "")) {
        throw new ApiError(400, "Name, category, unit, price and minOrder are required");
    }

    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile) {
        throw new ApiError(404, "Please complete your supplier profile before adding products");
    }

    // image optional hai
    const imageLocalPath = req.file?.path;
    let imageUrl = "";

    if (imageLocalPath) {
        const uploadedImage = await uploadOnCloudinary(imageLocalPath);
        if (!uploadedImage) {
            throw new ApiError(500, "Failed to upload product image");
        }
        imageUrl = uploadedImage.url;
    }


    const product = await Product.create({
        supplier: supplierProfile._id,
        category,
        name,
        unit,
        price,
        minOrder,
        stock: stock || 0,
        imageUrl,
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
    const { category, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
        .populate("supplier", "businessName market")
        .populate("category", "name");

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});


const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id)
        .populate("supplier", "businessName market address")
        .populate("category", "name");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, minOrder, stock, imageUrl } = req.body;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile || product.supplier.toString() !== supplierProfile._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this product");
    }


    if (name) product.name = name;
    if (price) product.price = price;
    if (minOrder) product.minOrder = minOrder;
    if (stock !== undefined) product.stock = stock;
    if (imageUrl) product.imageUrl = imageUrl;

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile || product.supplier.toString() !== supplierProfile._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this product");
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")

    );
});

export { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };