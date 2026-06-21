
import { Router } from "express";
import {validate} from "../../middleWare/Validation/Validation.js"
import * as CR from "./Cart.controller.js";
import * as CRV from "./CartValidation.js";




const CartRouter = Router();


// --> Add-To-Cart-Routes
CartRouter.post("/AddToCart",validate(CRV.addToCartSchema), CR.AddToCart);

// --> Get-Cart-Routes
CartRouter.get("/GetCart:CartId", CR.GetCart);

// --> create-checkout-session-Routes
CartRouter.post('/createCheckoutSession',validate(CRV.createCheckoutSchema), CR.CreateCheckoutSession);

// --> Update-Cart-Quantity-Routes
CartRouter.put("/UpdateProductQuantity",validate(CRV.updateQuantitySchema),  CR.UpdateQuantity);

// --> Remove-Product-From-Cart-Routes
CartRouter.delete("/RemoveFromCart",validate(CRV.RemoveFromCartSchema),  CR.RemoveFromCart);







export default CartRouter;