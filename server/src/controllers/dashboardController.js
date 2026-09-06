import { musicStoreService } from "../services/musicStoreService.js";

export const dashboardController = {
  async index(request, response, next) {
    try {
      response.json(await musicStoreService.getDashboard());
    } catch (error) {
      next(error);
    }
  }
};