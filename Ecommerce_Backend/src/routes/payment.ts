
import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { newCoupon ,applyDiscount,allCoupons,deleteCoupon} from "../controllers/payment.js";

 const app=express();

 app.post("/coupon/new",adminOnly,newCoupon);
 app.get("/discount",applyDiscount)
 app.get("/coupon/all",adminOnly,allCoupons)
 app.delete("/coupon/:id",adminOnly,deleteCoupon)

 export default app; 