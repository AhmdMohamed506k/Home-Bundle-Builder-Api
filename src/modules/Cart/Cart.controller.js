import { asyncHandler } from "../../middleWare/AsyncHandler/AsyncHandler.js";
import ProductModel from "../../../DB/Models/Product.model.js";
import CartModel from "../../../DB/Models/Cart.model.js";
import { nanoid } from 'nanoid';
import { CACHE_KEYS } from "../../utils/Redis/CacheKeys.js";
import { invalidateCache } from "../../utils/Redis/CacheInvalidator.js";
import redisClient from "../../utils/Redis/RedisClient.js";
import Stripe from 'stripe';




// --> AddProductToCart
export const AddToCart = asyncHandler(async (req, res, next) => {


    const { productId, quantity, cartId } = req.body;
    
   
    const product = await ProductModel.findById(productId);
    if (!product) return next(new Error("Product not found", { cause: 404 }));

  
    const unitPrice = product.HasOffer ? product.PriceAfterOffer  : product.BasePrice;

   
    let cart = await CartModel.findOne({ cartId });
    
    if (!cart) {
        cart = await CartModel.create({
            cartId: cartId || nanoid(),
            Products: [{ 
                productId, 
                quantity, 
                priceAtAddition: product.BasePrice, 
                finalPrice: unitPrice             
            }]
        });
    } else {

      
        const productIndex = cart.Products.findIndex(p => p.productId.toString() === productId);
        if (productIndex > -1) {
            cart.Products[productIndex].quantity += quantity;
            cart.Products[productIndex].finalPrice = unitPrice; 
        } else {
            cart.Products.push({ productId, quantity, priceAtAddition: product.BasePrice, finalPrice: unitPrice });
        }
    }


    cart.SubTotal = cart.Products.reduce((acc, item) => acc + (item.priceAtAddition * item.quantity), 0);
    cart.TotalAfterDiscount = cart.Products.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
    

    await invalidateCache("CartData_MODIFIED",{CartId:cartId})


    await cart.save();
    return res.status(200).json({ message: "Product added successfully", cart });
});

// --> GetCart
export const GetCart = asyncHandler(async (req, res, next) => {

    
    const { CartId } = req.params;



    const cacheKey = CACHE_KEYS.CartData(CartId);
    const cachedCart = await redisClient.get(cacheKey);
    if (cachedCart) {
        return res.status(200).json({source:"success", source: 'cache', cart: JSON.parse(cachedCart)});
    }

    
const cart = await CartModel.findOne({ cartId: CartId }).populate({
        path: 'Products.productId', 
        populate: {
            path: 'CategoryId',     
            select: 'Name'      
        }
    });
    
    console.log(cart)

    
    if (cart) {
        await redisClient.set(cacheKey, JSON.stringify(cart),{EX:3000}); 
    }

    return res.status(200).json({ cart, source: 'database' });
});

// --> UpdateProductQuantityInCart
export const UpdateQuantity = asyncHandler(async (req, res, next) => {
    
    const { productId, cartId, action } = req.body; 
    
    let cart = await CartModel.findOne({ cartId });
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));

    const productIndex = cart.Products.findIndex(p => p.productId.toString() === productId);
    
    if (productIndex === -1) return next(new Error("Product not in cart", { cause: 404 }));

   
    if (action === "increment") {
        cart.Products[productIndex].quantity += 1;
    } else if (action === "decrement") {
        cart.Products[productIndex].quantity -= 1;
    }

  
    if (cart.Products[productIndex].quantity <= 0) {
        cart.Products.splice(productIndex, 1); 
    }

   
    cart.SubTotal = cart.Products.reduce((acc, item) => acc + (item.priceAtAddition * item.quantity), 0);
    cart.TotalAfterDiscount = cart.Products.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
    

    cart.markModified('Products');
    await invalidateCache("CartData_MODIFIED", { CartId:cartId });
    await cart.save();

    return res.status(200).json({ message: "Cart updated", cart });
});

// --> RemoveProductFromCart
export const RemoveFromCart = asyncHandler(async (req, res, next) => {

    const { productId, cartId } = req.body;
    
    let cart = await CartModel.findOne({ cartId });
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));


    cart.Products = cart.Products.filter(p => p.productId.toString() !== productId);
    

    cart.SubTotal = cart.Products.reduce((acc, item) => acc + (item.priceAtAddition * item.quantity), 0);
    cart.TotalAfterDiscount = cart.Products.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
    
    
    await invalidateCache("CartData_MODIFIED", { CartId:cartId });
    await cart.save();

    return res.status(200).json({ message: "Product removed", cart });
});

// --> CreateCheckoutSession
export const CreateCheckoutSession = asyncHandler(async (req, res, next) => {

    const { cartId } = req.body;
   
    if (!cartId) return next(new Error("CartId is required", { cause: 400 }));

    const cart = await CartModel.findOne({ cartId });

    if (!cart || !cart.Products || cart.Products.length === 0) {
        return next(new Error("Cart not found or empty", { cause: 404 }));
    }

    const stripe = new Stripe(process.env.StripeSecretKey);

    const session = await stripe.checkout.sessions?.create({
        payment_method_types: ['card'],
        line_items: cart.Products.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Security Bundle Item' },
                unit_amount: Math.round(item.finalPrice * 100), 
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
    });
    
    return res.status(200).json({ url: session.url });
});