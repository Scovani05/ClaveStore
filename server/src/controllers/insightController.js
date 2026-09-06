import { musicInsightService } from "../services/musicInsightService.js";

export const insightController = {
  async show(request, response, next) {
    try {
      response.json(await musicInsightService.getInsight());
    } catch (error) {
      next(error);
    }
  }
};