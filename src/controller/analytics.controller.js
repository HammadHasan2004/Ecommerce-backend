import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SupplierProfile } from "../model/supplierProfile.model.js";
import { Product } from "../model/product.model.js";
import { OrderItem } from "../model/orderItem.model.js";

const getSupplierDashboard = asyncHandler(async (req, res) => {
    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile) {
        throw new ApiError(404, "Supplier profile not found");
    }

    // is supplier ke sab products ki IDs nikalo
    const products = await Product.find({ supplier: supplierProfile._id }).select("_id");
    const productIds = products.map((p) => p._id);

    // sab order items nikalo jo is supplier ke products ke hain, order ki info bhi saath mein
    const orderItems = await OrderItem.find({ product: { $in: productIds } }).populate("order");

    // sirf "delivered" orders ko revenue mein count karo (pending/cancelled nahi)
    const deliveredItems = orderItems.filter(
        (item) => item.order && item.order.status === "delivered"
    );

    // Revenue: har item ka (price * quantity) add karo
    const revenue = deliveredItems.reduce(
        (sum, item) => sum + item.priceAtOrder * item.quantity,
        0
    );

    // Unique orders count (ek order mein is supplier ke multiple items ho sakte hain)
    const uniqueOrderIds = new Set(deliveredItems.map((item) => item.order._id.toString()));

    // Average Order Value: revenue / total unique orders
    const averageOrderValue =
        uniqueOrderIds.size > 0 ? revenue / uniqueOrderIds.size : 0;

    // Customer Acquisition: kitne alag buyers ne khareeda (duplicate buyers count nahi honge)
    const uniqueBuyers = new Set(
        deliveredItems.map((item) => item.order.buyer.toString())
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                revenue,
                averageOrderValue: Number(averageOrderValue.toFixed(2)),
                totalCustomers: uniqueBuyers.size,
                totalDeliveredOrders: uniqueOrderIds.size,
            },
            "Dashboard data fetched successfully"
        )
    );
});

export { getSupplierDashboard };