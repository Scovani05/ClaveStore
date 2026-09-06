import { musicStoreService } from "../services/musicStoreService.js";

export const workspaceController = {
  async show(request, response, next) {
    try {
      response.json(await musicStoreService.getWorkspace());
    } catch (error) {
      next(error);
    }
  }
};