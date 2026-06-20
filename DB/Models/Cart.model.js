
import mongoose, { Schema, Types } from 'mongoose';

const cartSchema = new Schema({
    cartId: { type: String, unique: true },

    Products: [{
        productId: { 
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: { 
            type: Number,
            default: 1,
            min: 1 
        },
        priceAtAddition: { 
            type: Number,
            required: true
        }, 
        finalPrice: { 
            type: Number,
            required: true 
        } 
    }],
    
    SubTotal: {
        type: Number,
        default: 0 
    },
    TotalAfterDiscount: {
        type: Number,
        default: 0
    }


}, { 
    timestamps: true 
});



const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel