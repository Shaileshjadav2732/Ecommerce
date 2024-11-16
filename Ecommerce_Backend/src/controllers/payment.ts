import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Coupon } from "../models/coupon.js";

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount) {
    return next(
      new ErrorHandler("Please enter both coupon code and amount", 400)
    );
  }
  await Coupon.create({ coupon, amount });

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} Created Successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ coupon });
  if (!discount) {
    return next(new ErrorHandler("Inalid Coupon Code", 400));
  }

  return res.status(201).json({
    success: true,
    message: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.findOne();
  if (!coupons) {
    return next(new ErrorHandler("Not Any Cupon Avalable", 400));
  }

  return res.status(201).json({
    success: true,
    message: coupons,
  });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon=await Coupon.findByIdAndDelete(id);
if(!coupon) return next(new ErrorHandler("Invalid Coupon Id",400)) ;
  return res.status(201).json({
    success: true,
    message: ` Coupon ${coupon.coupon} Deleted  Successfully`,
  });
});
