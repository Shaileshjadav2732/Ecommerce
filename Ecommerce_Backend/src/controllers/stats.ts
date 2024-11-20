import { myCache } from "./../routes/product.js";
import { TryCatch } from "../middlewares/error.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Order from "./../models/order.js";
import { calculatePercentage } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};
  if (myCache.has("admin-stats"))
    stats = JSON.parse(myCache.get("admin-stats") as string);
  else {
    const today = new Date();
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth()),
    };

    const thisMonthProductPromise = await Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductPromise = await Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthUserPromise = await User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUserPromise = await User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const thisMonthOrderPromise = await Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrderPromise = await Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = await Order.find({
      createdAt: {
        $gte: sixMonthAgo,
        $lte: today,
      },
    });
    const latestTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthOrder,
      thisMonthProduct,
      thisMonthUser,
      lastMonthOrder,
      lastMonthProduct,
      lastMonthUser,
      productCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthOrderPromise,
      thisMonthProductPromise,
      thisMonthUserPromise,
      lastMonthOrderPromise,
      lastMonthProductPromise,
      lastMonthUserPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const lastMonthRevenue = thisMonthOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      thisMonthRevenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      user: calculatePercentage(thisMonthUser.length, lastMonthUser.length),
      product: calculatePercentage(
        thisMonthProduct.length,
        lastMonthProduct.length
      ),
      order: calculatePercentage(thisMonthOrder.length, lastMonthOrder.length),
    };
    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productCount,
      user: usersCount,
      order: allOrders.length,
    };
    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = today.getMonth() - creationDate.getMonth();

      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categortCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categortCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: Math.round((categoriesCount[i] / productCount) * 100),
      });
    });

    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));
    stats = {
      categories,
      categoriesCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthRevenue,
      },
      userRatio,
      latestTransaction:modifiedLatestTransaction
    };
  }

  myCache.set("admin-stats",JSON.stringify(stats));
  return res.status(200).json({
    success: true,
    stats: stats,
  });

});

export const getBarCharts = TryCatch(async (req, res, next) => {});

export const getPieCharts = TryCatch(async (req, res, next) => {});

export const getLineCharts = TryCatch(async (req, res, next) => {});
