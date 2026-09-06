import { musicStoreService } from "../services/musicStoreService.js";

export const orderController = {
  async index(request, response, next) {
    try {
      response.json(await musicStoreService.listOrders());
    } catch (error) {
      next(error);
    }
  },

  async create(request, response, next) {
    try {
      const order = await musicStoreService.createOrder(request.body);
      response.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      response.json(await musicStoreService.updateOrder(request.params.id, request.body));
    } catch (error) {
      next(error);
    }
  }
};