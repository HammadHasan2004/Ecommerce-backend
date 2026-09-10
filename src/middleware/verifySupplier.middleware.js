import { ApiError } from "../utils/ApiError.js";

export const verifySupplier = (req, _, next) => {
    if (req.user?.role !== "supplier") {
        throw new ApiError(403, "Only suppliers can perform this action");
    }
    next();
};