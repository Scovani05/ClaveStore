import crypto from "node:crypto";
import models from "../models/index.js";
import { getSampleDashboard } from "./sampleData.js";

const runtimeUsers = new Map();
const runtimeCarts = new Map();

export const hashPassword = (password) =>
  crypto.createHash("sha256").update(`clavestore:${password}`).digest("hex");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeRole = (role) => (role === "admin" ? "admin" : "client");

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  city: user.city || "Portugal"
});

const normalizeCartItems = (items) => {
  const grouped = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const productId = Number(item.productId);
    const quantity = Math.max(1, Number(item.quantity || 1));

    if (!Number.isFinite(productId)) {
      return;
    }

    grouped.set(productId, (grouped.get(productId) || 0) + quantity);
  });

  return Array.from(grouped, ([productId, quantity]) => ({ productId, quantity }));
};

const makeRuntimeKey = (email, role) => `${normalizeRole(role)}:${normalizeEmail(email)}`;

const seedRuntimeUsers = () => {
  if (runtimeUsers.size) {
    return;
  }

  [
    { id: 9001, name: "Cliente ClaveStore", email: "cliente@clavestore.pt", password: "cliente123", role: "client", city: "Viseu" },
    { id: 9002, name: "Paulo Admin", email: "admin@clavestore.pt", password: "admin123", role: "admin", city: "Viseu" }
  ].forEach((account) => {
    runtimeUsers.set(makeRuntimeKey(account.email, account.role), {
      ...account,
      passwordHash: hashPassword(account.password)
    });
  });

  runtimeCarts.set(9001, [{ productId: 101, quantity: 1 }]);
};

const ensureWorkspace = async () => {
  const sample = getSampleDashboard();
  const [workspace] = await models.Workspace.findOrCreate({
    where: { id: sample.workspace.id },
    defaults: sample.workspace
  });
  return workspace;
};

const authenticateRuntime = ({ email, password, role }) => {
  seedRuntimeUsers();
  const user = runtimeUsers.get(makeRuntimeKey(email, role));

  if (!user || user.passwordHash !== hashPassword(password)) {
    const error = new Error("Email ou palavra-passe incorretos.");
    error.status = 401;
    throw error;
  }

  return { user: publicUser(user), cart: { items: runtimeCarts.get(user.id) || [] } };
};

const registerRuntime = ({ name, email, password, role, city }) => {
  seedRuntimeUsers();
  const normalizedRole = normalizeRole(role);
  const normalizedEmail = normalizeEmail(email);
  const key = makeRuntimeKey(normalizedEmail, normalizedRole);

  if (runtimeUsers.has(key)) {
    const error = new Error("Já existe uma conta com esse email e perfil.");
    error.status = 409;
    throw error;
  }

  const user = {
    id: Date.now(),
    name: name || (normalizedRole === "admin" ? "Admin ClaveStore" : "Cliente ClaveStore"),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: normalizedRole,
    city: city || "Portugal"
  };

  runtimeUsers.set(key, user);
  runtimeCarts.set(user.id, []);

  return { user: publicUser(user), cart: { items: [] } };
};

export const authService = {
  async register(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const role = normalizeRole(payload.role);

    if (!email || password.length < 6) {
      const error = new Error("Indica um email válido e uma palavra-passe com pelo menos 6 caracteres.");
      error.status = 400;
      throw error;
    }

    try {
      const workspace = await ensureWorkspace();
      const existing = await models.User.findOne({ where: { email, role } });

      if (existing) {
        const error = new Error("Já existe uma conta com esse email e perfil.");
        error.status = 409;
        throw error;
      }

      const user = await models.User.create({
        workspaceId: workspace.id,
        name: payload.name || (role === "admin" ? "Admin ClaveStore" : "Cliente ClaveStore"),
        email,
        passwordHash: hashPassword(password),
        role,
        city: payload.city || "Portugal"
      });
      await models.Cart.create({ workspaceId: workspace.id, userId: user.id, items: [] });

      return { user: publicUser(user), cart: { items: [] } };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      return registerRuntime({ ...payload, email, password, role });
    }
  },

  async login(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const role = normalizeRole(payload.role);

    try {
      const user = await models.User.findOne({ where: { email, role }, include: [{ model: models.Cart, as: "cart" }] });

      if (!user || user.passwordHash !== hashPassword(password)) {
        const error = new Error("Email ou palavra-passe incorretos.");
        error.status = 401;
        throw error;
      }

      return { user: publicUser(user), cart: { items: user.cart?.items || [] } };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      return authenticateRuntime({ email, password, role });
    }
  },

  async getCart(userId) {
    try {
      const cart = await models.Cart.findOne({ where: { userId } });
      return { items: cart?.items || [] };
    } catch (error) {
      seedRuntimeUsers();
      return { items: runtimeCarts.get(Number(userId)) || [] };
    }
  },

  async saveCart(userId, items) {
    const safeItems = normalizeCartItems(items);

    try {
      const user = await models.User.findByPk(userId);

      if (!user) {
        const error = new Error("Utilizador não encontrado.");
        error.status = 404;
        throw error;
      }

      const [cart] = await models.Cart.findOrCreate({
        where: { userId },
        defaults: { workspaceId: user.workspaceId, userId, items: safeItems }
      });
      await cart.update({ items: safeItems });
      return { items: safeItems };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      seedRuntimeUsers();
      runtimeCarts.set(Number(userId), safeItems);
      return { items: safeItems };
    }
  }
};