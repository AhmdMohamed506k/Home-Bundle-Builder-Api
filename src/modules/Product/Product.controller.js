import { asyncHandler } from "../../middleWare/AsyncHandler/AsyncHandler.js";
import {invalidateCache} from "../../utils/Redis/CacheInvalidator.js";
import CategoryModel from "../../../DB/Models/Category.model.js";
import ProductModel from "../../../DB/Models/Product.model.js";
import cloudinary from "../../utils/Cloudinary/Cloudinary.js";
import { nanoid } from "nanoid";



// --> AddNewProduct
export const AddNewProduct = asyncHandler(async (req, res, next) => {

    const { CategoryId,CategoryName, ProductName, Description, Stock, Brand,ColorName,ColorHex, BasePrice, HasOffer, TotalOffer, PriceAfterOffer, HasVariants, Variants } = req.body;

    const CategoryExist = await CategoryModel.findById(CategoryId);
    if (!CategoryExist) return next(new Error("Category not found", { cause: 404 }));
      
    const ProductExist = await ProductModel.findOne({ ProductName });
    if (ProductExist) return next(new Error("Product already exists", { cause: 409 }));

  
    if (!req.files || !req.files.mainImage ) {
    return res.status(400).json({ message: "File not received" });
   }
    
    
     
    const { secure_url: mainUrl, public_id: mainId } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: `BundleBuild/${CategoryExist.Name}/products/${ProductName}/Main`,
    
        
    });
  
   
    let processedVariants = [];
    if (HasVariants && req.files.variantImages) {
        
        const parsedVariants = JSON.parse(Variants);

        
        processedVariants = await Promise.all(parsedVariants.map(async (v, index) => {
              
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.variantImages[index].path, {
                folder: `BundleBuild/${CategoryExist.Name}/products/${ProductName}/Variants`
            });

            return { ...v, ImageUrl: { secure_url, public_id } };
        }));

     
        
    }

  
    const productData = {
        CategoryId,CategoryName, ProductName, Description, Stock, Brand,ColorName,ColorHex, BasePrice, HasOffer, TotalOffer, PriceAfterOffer, HasVariants,
        Variants: processedVariants,
        ImageUrl: { secure_url: mainUrl, public_id: mainId }
    };

  
    await invalidateCache("CategoryProducts_MODIFIED", { CategoryId });
    await invalidateCache("Category_MODIFIED", { CategoryId: "ALL" });
  




    const newProduct = await ProductModel.create(productData);


    return res.status(201).json({ message: "Product created successfully", newProduct });
});

// --> UpdateProduct
export const UpdateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const {  Variants, ...productData } = req.body;
    
  
    
    const product = await ProductModel.findById(productId).populate('CategoryId');
    if (!product) return next(new Error("Product not found", { cause: 404 }));

   
    if (req.files?.mainImage) {
        if (product.ImageUrl?.public_id) {
            await cloudinary.uploader.destroy(product.ImageUrl.public_id);
        }
        
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: `BundleBuild/${product.CategoryId.Name}/products/${productData.ProductName || product.ProductName}/Main`
        });
        productData.ImageUrl = { secure_url, public_id };
    }

  
    if (req.files?.variantImages && Variants) {
        const parsedVariants = JSON.parse(Variants);
        let updatedVariantsArray = [];

        for (let i = 0; i < parsedVariants.length; i++) {
            let currentVariant = parsedVariants[i];

         
            if (req.files.variantImages[i]) {
                
                if (currentVariant.ImageUrl?.public_id) {
                    await cloudinary.uploader.destroy(currentVariant.ImageUrl.public_id);
                }
                
          
                const { secure_url, public_id } = await cloudinary.uploader.upload(
                    req.files.variantImages[i].path, 
                    { folder: `BundleBuild/${product.CategoryId.Name}/products/${productData.ProductName || product.ProductName}/Variants` }
                );
                currentVariant.ImageUrl = { secure_url, public_id };
            }
            
            updatedVariantsArray.push(currentVariant);
        }
        productData.Variants = updatedVariantsArray;
    }
    

    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, productData, { new: true });
    
  
    await invalidateCache("CategoryProducts_MODIFIED", { CategoryId: product.CategoryId._id });
    await invalidateCache("ProductInfo_MODIFIED", { ProductId: productId });

    return res.status(200).json({ message: "Product updated successfully", updatedProduct });
});

// --> DeleteProduct
export const DeleteProduct = asyncHandler(async (req, res, next) => {

    const { productId } = req.params;

    const product = await ProductModel.findById(productId);
    if (!product) return next(new Error("Product not found", { cause: 404 }));
   
   
    if (product.ImageUrl?.public_id) {
        await cloudinary.uploader.destroy(product.ImageUrl.public_id);
    }


    if (product.Variants && product.Variants.length > 0) {
        for (const variant of product.Variants) {
            if (variant.ImageUrl?.public_id) {
                await cloudinary.uploader.destroy(variant.ImageUrl.public_id);
            }
        }
    }

    await invalidateCache("CategoryProducts_MODIFIED", { CategoryId: product.CategoryId });
    await invalidateCache("ProductInfo_MODIFIED", { ProductId: productId });


    await ProductModel.findByIdAndDelete(productId);

    return res.status(200).json({ message: "Product deleted successfully" });
});

