import { authService } from "../services/authService.js";

export const authController = {
  async register(request, response, next) {
    try {
      response.status(201).json(await authService.register(request.body));
    } catch (error) {
      next(error);
    }
  },

  async login(request, response, next) {
    try {
      response.json(await authService.login(request.body));
    } catch (error) {
      next(error);
    }
  }
};