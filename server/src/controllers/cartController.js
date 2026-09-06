import { authService } from "../services/authService.js";

export const cartController = {
  async show(request, response, next) {
    try {
      response.json(await authService.getCart(request.params.userId));
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      response.json(await authService.saveCart(request.params.userId, request.body.items));
    } catch (error) {
      next(error);
    }
  }
};