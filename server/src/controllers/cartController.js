import { authService } from "../services/authService.js";

export const cartController = {
  async show(request, response, next) {
    try {
      response.json(await authService.getCart(request.auth.userId));
    } catch (error) {
      next(error);
    }
  },

  async update(request, response, next) {
    try {
      response.json(await authService.saveCart(request.auth.userId, request.body.items));
    } catch (error) {
      next(error);
    }
  }
};