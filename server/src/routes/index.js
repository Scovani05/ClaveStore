import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { cartController } from "../controllers/cartController.js";
import { categoryController } from "../controllers/categoryController.js";
import { dashboardController } from "../controllers/dashboardController.js";
import { insightController } from "../controllers/insightController.js";
import { orderController } from "../controllers/orderController.js";
import { productController } from "../controllers/productController.js";
import { workspaceController } from "../controllers/workspaceController.js";
import { optionalAuth, requireAuth, requireRole, requireSelfOrAdmin } from "../middleware/securityMiddleware.js";

const router = Router();

router.get("/health", (request, response) => {
  response.json({ status: "ok", product: "ClaveStore PT", timestamp: new Date().toISOString() });
});

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.get("/carts/:userId", requireAuth, requireSelfOrAdmin("userId"), cartController.show);
router.put("/carts/:userId", requireAuth, requireSelfOrAdmin("userId"), cartController.update);

router.get("/dashboard", optionalAuth, dashboardController.index);
router.get("/workspace", workspaceController.show);
router.get("/categories", categoryController.index);
router.get("/products", productController.index);
router.post("/products", requireAuth, requireRole("admin"), productController.create);
router.patch("/products/:id", requireAuth, requireRole("admin"), productController.update);
router.get("/orders", requireAuth, requireRole("admin"), orderController.index);
router.post("/orders", requireAuth, requireRole("client"), orderController.create);
router.patch("/orders/:id", requireAuth, requireRole("admin"), orderController.update);
router.get("/insights/music-store", requireAuth, requireRole("admin"), insightController.show);

export default router;