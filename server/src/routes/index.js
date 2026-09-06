import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { cartController } from "../controllers/cartController.js";
import { categoryController } from "../controllers/categoryController.js";
import { dashboardController } from "../controllers/dashboardController.js";
import { insightController } from "../controllers/insightController.js";
import { orderController } from "../controllers/orderController.js";
import { productController } from "../controllers/productController.js";
import { workspaceController } from "../controllers/workspaceController.js";

const router = Router();

router.get("/health", (request, response) => {
  response.json({ status: "ok", product: "ClaveStore PT", timestamp: new Date().toISOString() });
});

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/carts/:userId", cartController.show);
router.put("/carts/:userId", cartController.update);

router.get("/dashboard", dashboardController.index);
router.get("/workspace", workspaceController.show);
router.get("/categories", categoryController.index);
router.get("/products", productController.index);
router.post("/products", productController.create);
router.patch("/products/:id", productController.update);
router.get("/orders", orderController.index);
router.post("/orders", orderController.create);
router.patch("/orders/:id", orderController.update);
router.get("/insights/music-store", insightController.show);

export default router;