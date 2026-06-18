

import joi from 'joi';


export const addToCartSchema = {
    body: joi.object({
        productId: joi.string().hex().length(24).required(), 
        quantity: joi.number().integer().min(1).required(),   
        cartId: joi.string().required()                      
    }).required()
}

export const updateQuantitySchema = {
    body: joi.object({
        productId: joi.string().hex().length(24).required(),
        cartId: joi.string().required(),
        action: joi.string().valid('increment', 'decrement').required()
    }).required()
};


export const RemoveFromCartSchema = {
    body: joi.object({
        productId: joi.string().hex().length(24).required(),
        cartId: joi.string().required(),
    }).required()
};


export const createCheckoutSchema = {
    body: joi.object({
        cartId: joi.string().required()
    }).required()
};