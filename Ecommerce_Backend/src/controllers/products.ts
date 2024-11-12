import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import Product from "../models/products.js";
import { NewProductRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { promises as fsPromises } from "fs";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("please Add Photo", 400));

    if (!name || !price || !stock || !category) {
      // photo delete in upload folder
      rm(photo.path, () => {
        console.log("Deleted");
      });

      return next(new ErrorHandler("Please enter all Fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const getLatestProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const products = await Product.find({})
      .sort({
        createdAt: -1, //sort in desending  -1
      })
      .limit(5);

    return res.status(200).json({
      success: true,
      products,
    });
  }
);

export const getAllCategories = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const categories = await Product.distinct("category");
    return res.status(200).json({
      success: true,
      categories,
    });
  }
);

export const getAdminProducts = TryCatch(async (req, res, next) => {
  const products = await Product.find({});

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  return res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photo) {
    try {
      await fsPromises.unlink(product.photo);
      console.log("Old Photo Deleted");
      product.photo = photo.path;
    } catch (error) {
      console.error("Error deleting old photo:", error);
      return next(new ErrorHandler("Error updating product photo", 500));
    }
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category.toLowerCase();

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  rm(product.photo, () => {
    console.log(" Product Photo Deleted");
  });

  await product.deleteOne();
  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});
