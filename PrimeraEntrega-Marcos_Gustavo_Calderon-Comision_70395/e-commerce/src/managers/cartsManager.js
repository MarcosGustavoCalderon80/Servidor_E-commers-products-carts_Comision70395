import fs from "fs";
import { v4 as uuid } from "uuid";
import { ProductManager } from "./productManager.js";

export class CartsManager {
  constructor() {
    this.carts = [];
    this.path = "./src/managers/data/carts.json";
  }
  // Obtiene los carritos con un límite opcional
  async getCarts(limit) {
    const file = await fs.promises.readFile(this.path, "utf-8");
    const fileParse = JSON.parse(file);
    
    this.carts = fileParse || [];
    if (!limit) return this.carts;
    
    return this.carts.slice(0, limit);
  }
  // Agrega un nuevo carrito
  async addCart(cart) {
    await this.getCarts();
    //Limitar la cantidad en creacion de cart.
    if (this.carts.length >= 100) {
      throw new Error("Número máximo de carritos alcanzado (100)");
    }

    const newCart = {
      id: uuid(),
      quantity: cart.quantity || 0,
      products: []
    };
    this.carts.push(newCart);

    await fs.promises.writeFile(this.path, JSON.stringify(this.carts));
    
    return newCart;
  }
  // Obtiene un carrito por ID
  async getCartById(cid) {
    await this.getCarts();
    const cart = this.carts.find((cart) => cart.id === cid);
    if (!cart) throw new Error(`No se encuentra el carrito con el id ${cid}`);
    
    return cart; // Devuelve todo el objeto de carrito
  }
  // Agrega un producto a un carrito
  async addProductToCart(cid, pid, quantity) {
    const cart = await this.getCartById(cid); 

    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.find((product) => product.product === pid);

    if (existingProduct) {
      // Si el producto ya existe, sumamos la cantidad
      existingProduct.quantity += quantity;
    } else {
      // Si el producto no existe, lo agregamos con la cantidad especificada
      cart.products.push({
        product: pid,
        quantity: quantity
      });
    }

    // Actualizar el total de productos en el carrito
    cart.quantity = cart.products.reduce((total, product) => total + product.quantity, 0);

    // Obtener el producto para verificar el stock
    const productManager = new ProductManager();
    const product = await productManager.getProductById(pid);

    // Verificar si hay suficiente stock disponible
    if (product.stock < quantity) {
      throw new Error(`No hay suficiente stock para el producto ${product.title}`);
    }
    // Restar el stock del producto
    product.stock -= quantity;
    // Actualizar el producto con el nuevo stock
    await productManager.updateProduct(pid, { stock: product.stock });

    // Guardar los cambios en el archivo JSON 
    await fs.promises.writeFile(this.path, JSON.stringify(this.carts));

    return cart;
  }
}
