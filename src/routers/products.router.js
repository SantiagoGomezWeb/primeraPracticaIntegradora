import { Router } from 'express';
import ProductManager from '../DAO/mongo/managers/products.js';
const routerP = Router()

const pm = new ProductManager()

routerP.get('/', async (request, response) => {
    try {
        let { limit } = request.query

        const products = await pm.getProducts();

        if (!limit) return response.status(200).send({ products })

        if (isNaN(Number(limit))) return response.status(400).send({message: 'Valor de limite invalido' })
        limit = Number(limit)

        if (limit<0) return response.status(400).send({message: 'El limite no puede ser inferior a 0'})
        if (products.length > limit) {
            const limitProduct = products.slice(0, limit)
            return response.status(200).send({ limit, products:limitProduct });
        }
        return response.status(200).send({ products });
    } catch (err) {
        console.log(err);
    }
})

routerP.get('/:pid', async (request, response) => {
    try {
        const { pid } = request.params
        const result = await pm.getProductById(pid)
        console.log(result, 'resultado');
        if (result.message) return response.status(404).send({ message: `ID: ${pid} no encontrado`})
        return response.status(200).send( result );
    } catch (err) {
        console.log(err);
    }

})


routerP.post('/', async (request, response) => {
    try {
        const product = request.body
        const {
            title,
            description,
            price,
            code,
            stock,
            status,
            category,
            thumbnails
        } = product
        
        const checkProduct = Object.values({
            title,
            description,
            price,
            code,
            stock,
            status,
            category,
            thumbnails
        }).every(property => property)

        if(!checkProduct) return response
        .status(400)
        .send( {message:"El producto no tiene todas sus propiedades"} );

        if (!(typeof title === 'string' && 
                typeof description === 'string' && 
                typeof price === 'number' && 
                typeof code === 'string' && 
                typeof stock === 'number' && 
                typeof status === 'boolean' && 
                typeof category === 'string' && 
                Array.isArray(thumbnails))) 
                return response.status(400).send({message:'Tipo de Propiedad INvalido' })

        if(price < 0 || stock < 0 ) return response
        .status(400)
        .send({message: 'El Producto y Stock no pueden tener valor menor o igual a cero' });

        const result = await pm.addProduct(product)
        console.log(result)
        if (result.code === 11000) return response
        .status(400)
        .send( {message: `Clave duplicada: ecommerce.products key code: ${ result.keyValue.code }`} );

        return response.status(201).send(result);
    }
    catch (err) {
        console.log(err);
        
    }
})

routerP.put('/:pid', async (request, response) => {
    try {
        const { pid } = request.params
        const product = request.body
        const result = await pm.updateProduct(pid, product);
        console.log(result);
        if (result.message) return response.status(404).send({ message: `ID: ${pid} not found`})
        return response.status(200).send( `El Producto ${result.title} con ID: ${result._id} fue updateado` );
    }
    catch (err) {
        console.log(err);
    };

})

routerP.delete('/:pid', async (request, response) => {
    try {
        const { pid } = request.params
        const result = await pm.deleteProduct(pid)
        // console.log(result)
        if (!result) return response.status(404).send({ message: `ID: ${pid} no encontrado`})
        return response.status(200).send({ message: `ID: ${pid} fue borrado` });
    } catch (err) {
        console.log(err);
    }
})

export default routerP;