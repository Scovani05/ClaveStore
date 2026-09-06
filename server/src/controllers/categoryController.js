import { musicStoreService } from "../services/musicStoreService.js";

export const categoryController = {
  async index(request, response, next) {
    try {
      response.json(await musicStoreService.listCategories());
    } catch (error) {
      next(error);
    }
  }
};