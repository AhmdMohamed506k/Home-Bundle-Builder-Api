import redisClient from "./RedisClient.js";
import { CACHE_KEYS } from "./CacheKeys.js";


export const invalidateCache =async (action, data = {})=>{
    const { CategoryId ,ProductId,CartId} = data;
    let keysToDel = [];
   

    switch (action) {

        case "Category_MODIFIED":
            if(CategoryId){
                keysToDel.push(CACHE_KEYS.NewCategory(CategoryId))
            }

        break;


        case "CategoryProducts_MODIFIED":
            if (CategoryId) {
                keysToDel.push(CACHE_KEYS.CategoryProducts(CategoryId))
            }
            

        break;
        

        case "ProductInfo_MODIFIED":
            if(ProductId){
                keysToDel.push(CACHE_KEYS.ProductInfo(ProductId))
            }
            

        break;

   
        case "CartData_MODIFIED":
            if(CartId){
                keysToDel.push(CACHE_KEYS.CartData(CartId))
            }
            

        break;


    
        default:
            console.warn(`[Cache Invalidator]: Unknown action type: ${action}`);
            return;

            
    }

    
    if (keysToDel.length > 0) {
        
        const uniqueKeys = [...new Set(keysToDel)];
        await redisClient.del(uniqueKeys);
        
        console.log(`[Cache Invalidator]: Successfully cleared keys:`, uniqueKeys);
    }
}