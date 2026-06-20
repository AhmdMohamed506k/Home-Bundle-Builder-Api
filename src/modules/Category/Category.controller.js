import CategoryModel from "../../../DB/Models/Category.model.js";
import { asyncHandler } from "../../middleWare/AsyncHandler/AsyncHandler.js";
import { invalidateCache } from "../../utils/Redis/CacheInvalidator.js";
import { CACHE_KEYS } from "../../utils/Redis/CacheKeys.js";
import redisClient from "../../utils/Redis/RedisClient.js";
import slugify from "slugify";







// --> GetAllCategoriesWithProducts
export const GetAllCategoriesWithProducts = asyncHandler(async (req, res, next) => {
    
   
    const categories = await CategoryModel.aggregate([
        {
          
            $lookup: {
                from: "products",         
                localField: "_id",        
                foreignField: "CategoryId", 
                as: "products"           
            }
        },
        {
       
            $project: {
                Name: 1,
                Slug: 1,
                products: 1 
            }
        }
    ]);

    return res.status(200).json({ message: "Success",Count:categories.length , categories });
});
// --- Create Category ---
export const CreateCategory = asyncHandler(async (req,res,next)=>{

    const { Name , Description }= req.body;

    if(!Name ){return next(new Error("Name and Description are Required"),{cause:406})}

    const CategoryExist = await CategoryModel.findOne({Name})
    if(CategoryExist){next(new Error("Category Already Exist Please choose different Category name  "))}



    const newCategory= await CategoryModel.create({Name,Description , Slug:slugify(Name,{lower:true})});
      
    await invalidateCache("Category_MODIFIED", { CategoryId: 'ALL' });

    res.status(201).json({ success: true, message: "Category Created Successfully", data: newCategory });

})
// --- Update Category ---
export const UpdateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { Name, Description } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
        return next(new Error("Category not found", { cause: 404 }));
    }

    if (Name) {
        category.Name = Name;
        category.Slug = slugify(Name, { lower: true });
    }
    if (Description) category.Description = Description;

    await category.save();

  
    await invalidateCache("Category_MODIFIED", { CategoryId: 'ALL' });

    res.status(200).json({ success: true, message: "Category Updated Successfully", data: category });
});
// --- Delete Category ---
export const DeleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) {
        return next(new Error("Category not found", { cause: 404 }));
    }

    await invalidateCache("Category_MODIFIED", { CategoryId: 'ALL' });

    res.status(200).json({ success: true, message: "Category Deleted Successfully" });
});