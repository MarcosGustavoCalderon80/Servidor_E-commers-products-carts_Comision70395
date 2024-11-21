import { Router } from "express";
import { CartsManager } from "../managers/cartsManager.js";

const cartsManager = new CartsManager();
const router = Router();

// Obtener todos los carritos con un límite opcional
router.get("/", async (req, res) => {
  const { limit } = req.query;
  try {
    const carts = await cartsManager.getCarts(limit);
    res.send(carts);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message); // Enviar un error 500 en caso de fallo
  }
});

// Obtener un carrito específico por su ID
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartsManager.getCartById(cid);
    res.send(cart);
  } catch (error) {
    console.log(error);
    res.status(404).send(`Carrito con el id ${cid} no encontrado`);
  }
});

// Crear un nuevo carrito
router.post("/", async (req, res) => {
try {
  const newCart = await cartsManager.addCart(req.body);
  res.status(201).send(newCart); // Código 201 Created
} catch (error) {
  console.log(error);
  res.status(500).send("Error al crear el carrito");
}
});
// Agregar un producto a un carrito específico
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params; // Obtenemos los parámetros de la URL
  const { quantity } = req.body;  // Obtenemos la cantidad desde el cuerpo de la solicitud

  if (!quantity || quantity <= 0) {
    return res.status(400).send("La cantidad debe ser un número positivo"); // Validación de cantidad
  }

  try {
    const updatedCart = await cartsManager.addProductToCart(cid, pid, quantity); // Llamamos a addProductToCart
    res.send(updatedCart); // Retornamos el carrito actualizado
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message); // Error 500 en caso de fallo
  }
});

export default router;
