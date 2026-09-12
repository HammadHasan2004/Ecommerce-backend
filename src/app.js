// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from './routes/user.routes.js';

//routes declaraton
app.use("/api/v1/users",userRouter)

import supplierProfileRouter from "./routes/supplierProfile.routes.js";
app.use("/api/v1/suppliers", supplierProfileRouter);


import productRouter from "./routes/product.routes.js";
app.use("/api/v1/products", productRouter);

import categoryRouter from "./routes/category.routes.js";
app.use("/api/v1/categories", categoryRouter);


import orderRouter from "./routes/order.routes.js";
app.use("/api/v1/orders", orderRouter);
export { app };