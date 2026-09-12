import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../model/order.model.js";
import { OrderItem } from "../model/orderItem.model.js";
import { Product } from "../model/product.model.js";

import { SupplierProfile } from "../model/supplierProfile.model.js";

const createOrder = asyncHandler(async (req, res) => {
    // items expected: [{ productId, quantity }, { productId, quantity }, ...]
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Order must contain at least one item");
    }

    let totalAmount = 0;
    const validatedItems = [];

    // pehle sab items validate karo, koi save nahi karte abhi
    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new ApiError(404, `Product not found: ${item.productId}`);
        }

        if (item.quantity < product.minOrder) {
            throw new ApiError(
                400,
                `Minimum order for ${product.name} is ${product.minOrder} ${product.unit}`
            );
        }

        if (item.quantity > product.stock) {
            throw new ApiError(
                400,
                `Not enough stock for ${product.name}. Available: ${product.stock}`
            );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
            product,
            quantity: item.quantity,
            priceAtOrder: product.price,
        });
    }

    // ab jab sab valid hai, tabhi Order banao
    const order = await Order.create({
        buyer: req.user._id,
        status: "pending",
        totalAmount,
    });

    // har item ke liye OrderItem banao, aur stock kam karo
    for (const item of validatedItems) {
        await OrderItem.create({
            order: order._id,
            product: item.product._id,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
        });

        item.product.stock -= item.quantity;
        await item.product.save();
    }

    return res.status(201).json(
        new ApiResponse(201, order, "Order placed successfully")
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    );
});

const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // sirf apni order dekh sake, doosre ki nahi
    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to view this order");
    }

    const items = await OrderItem.find({ order: order._id }).populate(
        "product",
        "name unit imageUrl"
    );

    return res.status(200).json(
        new ApiResponse(200, { order, items }, "Order fetched successfully")
    );
});

//update order status by supplier
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["confirmed", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // check karo yeh supplier is order mein shamil hai ya nahi
    const supplierProfile = await SupplierProfile.findOne({ owner: req.user._id });

    if (!supplierProfile) {
        throw new ApiError(404, "Supplier profile not found");
    }

    const orderItems = await OrderItem.find({ order: order._id }).populate("product");

    const supplierHasItemInOrder = orderItems.some(
        (item) => item.product.supplier.toString() === supplierProfile._id.toString()
    );

    if (!supplierHasItemInOrder) {
        throw new ApiError(403, "You are not allowed to update this order");
    }

    order.status = status;
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

//cancel order by customer only if status is pending
const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // sirf apni order cancel kar sake
    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to cancel this order");
    }

    // sirf "pending" order cancel ho sakti hai
    if (order.status !== "pending") {
        throw new ApiError(400, `Cannot cancel an order that is already ${order.status}`);
    }

    // stock wapas add karo (kyunki order cancel ho rahi hai)
    const orderItems = await OrderItem.find({ order: order._id });
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});

export { createOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder };
