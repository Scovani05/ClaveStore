import { musicStoreService } from "../services/musicStoreService.js";

export const productController = {
  async index(request, response, next) {
    try {
      response.json(await musicStoreService.listProducts(request.query));
    } catch (error) {
      next(error);
    }
  },

  async create(request, response, next) {
    try {
      const product = await musicStoreService.createProduct(request.body);
      response.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      response.json(await musicStoreService.updateProduct(request.params.id, request.body));
    } catch (error) {
      next(error);
    }
  }
};