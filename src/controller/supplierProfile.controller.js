import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SupplierProfile } from "../model/supplierProfile.model.js";

const createSupplierProfile = asyncHandler(async (req, res) => {
    const { businessName, market, address, bio } = req.body;

    if ([businessName, market].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Business name and market are required");
    }

    const existingProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (existingProfile) {
        throw new ApiError(409, "Supplier profile already exists for this user");
    }

    const supplierProfile = await SupplierProfile.create({
        owner: req.user._id,
        businessName,
        market,
        address,
        bio,
    });

    return res.status(201).json(
        new ApiResponse(201, supplierProfile, "Supplier profile created successfully")
    );
});

// buyer ya koi bhi kisi specific supplier ka profile dekh sake (public)
const getSupplierProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const supplierProfile = await SupplierProfile.findById(id).populate(
        "owner",
        "username fullname email"
    );

    if (!supplierProfile) {
        throw new ApiError(404, "Supplier profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, supplierProfile, "Supplier profile fetched successfully")
    );
});

// logged-in supplier apna khud ka profile check kare (login ke baad)
const getMySupplierProfile = asyncHandler(async (req, res) => {
    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile) {
        throw new ApiError(404, "Supplier profile not found. Please complete your profile.");
    }

    return res.status(200).json(
        new ApiResponse(200, supplierProfile, "Supplier profile fetched successfully")
    );
});

const updateSupplierProfile = asyncHandler(async (req, res) => {
    const { businessName, market, address, bio } = req.body;

    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile) {
        throw new ApiError(404, "Supplier profile not found");
    }

    if (businessName) supplierProfile.businessName = businessName;
    if (market) supplierProfile.market = market;
    if (address) supplierProfile.address = address;
    if (bio) supplierProfile.bio = bio;

    await supplierProfile.save();

    return res.status(200).json(
        new ApiResponse(200, supplierProfile, "Supplier profile updated successfully")
    );
});

export {
    createSupplierProfile,
    getSupplierProfile,
    getMySupplierProfile,
    updateSupplierProfile,
};