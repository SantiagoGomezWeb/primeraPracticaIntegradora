import { Router, request, response } from 'express';
import CartManager from '../DAO/mongo/managers/carts.js';
import ProductManager from '../DAO/mongo/managers/products.js';

const routerC = Router()

const cm = new CartManager()
const pm = new ProductManager()

routerC.get('/', async (request, response) => {
    const result = await cm.getCarts()
    console.log(result);
    return response.status(200).send(result)
})

routerC.get('/:cid', async (request, response) => {
    try {
        const { cid } = request.params

        const result = await cm.getCartById(cid)

        if (!result) return response.status(404).send({ message: 'ID not found' });
        return response.status(200).send(result);
    } catch (err) {
        console.log(err);
    }

})


routerC.post('/', async (request, response) => {
    try {
        const { products } = request.body

        if (!Array.isArray(products)) return response.status(400).send({ status: 'error', message: 'TypeError' });

        const results = await Promise.all(products.map(async (product) => {
            const checkId = await pm.getProductById(product._id);
            if ('error' in checkId) {
                return {error: checkId.error, _id:product._id}
            }
        }))
        const check = results.find(value => value !== undefined)
        if (check) return response.status(404).send(check)

        const cart = await cm.addCart(products)
                
        response.status(200).send(cart);
    }
    catch (err) {
        console.log(err);
    }
})

routerC.post('/:cid/product/:pid', async (request, response) => {
    let { cid, pid } = request.params
    const { quantity } = request.body
    const checkIdProduct = await pm.getProductById(pid);
    if ('error' in checkIdProduct) return response.status(404).send({error: `The ID product: ${pid} not found`})
    const checkIdCart = await cm.getCartById(cid)
    if ('reason' in checkIdCart) return response.status(404).send({error: `The ID cart: ${cid} not found`})
    const result = await cm.addProductInCart(cid, { _id: pid, quantity })
    return response.status(200).send({message:`added product ID: ${pid}, in cart ID: ${cid}`, cart: result});
})

export default routerC;