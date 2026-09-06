import { musicStoreService } from "../services/musicStoreService.js";

export const dashboardController = {
  async index(request, response, next) {
    try {
      response.json(await musicStoreService.getDashboard({ includeOrders: request.auth?.role === "admin" }));
    } catch (error) {
      next(error);
    }
  }
};