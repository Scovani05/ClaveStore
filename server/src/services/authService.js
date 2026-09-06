import crypto from "node:crypto";
import models from "../models/index.js";
import { getSampleDashboard } from "./sampleData.js";

const runtimeUsers = new Map();
const runtimeCarts = new Map();

const passwordAlgorithm = "scrypt";
const scryptOptions = { N: 16384, r: 8, p: 1 };
const tokenTtlSeconds = Number(process.env.AUTH_TOKEN_HOURS || 8) * 60 * 60;

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const safeText = (value, max = 120) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const normalizeEmail = (email) => safeText(email, 160).toLowerCase();
const normalizeRole = (role) => (role === "admin" ? "admin" : "client");
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const publicUser = (user) => ({
  id: Number(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  city: user.city || "Portugal"
});

const canUseRuntimeFallback = () => process.env.DEMO_FALLBACK !== "false";

const secureCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const legacyHashPassword = (password) =>
  crypto.createHash("sha256").update(`clavestore:${password}`).digest("hex");

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = crypto.scryptSync(String(password), salt, 64, scryptOptions).toString("base64url");
  return `${passwordAlgorithm}$${scryptOptions.N}$${scryptOptions.r}$${scryptOptions.p}$${salt}$${key}`;
};

export const passwordNeedsRehash = (storedHash = "") => !String(storedHash).startsWith(`${passwordAlgorithm}$`);

export const verifyPassword = (password, storedHash = "") => {
  const hash = String(storedHash || "");

  if (hash.startsWith(`${passwordAlgorithm}$`)) {
    const [, cost, blockSize, parallelization, salt, expectedKey] = hash.split("$");

    if (!cost || !blockSize || !parallelization || !salt || !expectedKey) {
      return false;
    }

    try {
      const derivedKey = crypto
        .scryptSync(String(password), salt, Buffer.from(expectedKey, "base64url").length, {
          N: Number(cost),
          r: Number(blockSize),
          p: Number(parallelization)
        })
        .toString("base64url");

      return secureCompare(derivedKey, expectedKey);
    } catch (error) {
      return false;
    }
  }

  return secureCompare(legacyHashPassword(password), hash);
};

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET || "clavestore-local-development-secret-change-before-production";

  if (process.env.NODE_ENV === "production" && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
    throw createHttpError("AUTH_SECRET deve estar configurado com pelo menos 32 caracteres.", 500);
  }

  return secret;
};

const encodeJson = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decodeJson = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
const signTokenData = (data) => crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url");

export const createSessionToken = (user) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    sub: String(user.id),
    role: user.role,
    email: normalizeEmail(user.email),
    name: safeText(user.name, 80),
    city: safeText(user.city || "Portugal", 80),
    iat: issuedAt,
    exp: issuedAt + tokenTtlSeconds
  });
  const body = `${header}.${payload}`;

  return `${body}.${signTokenData(body)}`;
};

export const verifySessionToken = (token) => {
  const parts = String(token || "").split(".");

  if (parts.length !== 3) {
    throw createHttpError("Sessão inválida. Inicia sessão novamente.", 401);
  }

  const [header, payload, signature] = parts;
  const body = `${header}.${payload}`;

  if (!secureCompare(signTokenData(body), signature)) {
    throw createHttpError("Sessão inválida. Inicia sessão novamente.", 401);
  }

  let session;

  try {
    session = decodeJson(payload);
  } catch (error) {
    throw createHttpError("Sessão inválida. Inicia sessão novamente.", 401);
  }

  const userId = Number(session.sub);
  const role = session.role;
  const expiresAt = Number(session.exp || 0);

  if (!Number.isFinite(userId) || !["client", "admin"].includes(role)) {
    throw createHttpError("Sessão inválida. Inicia sessão novamente.", 401);
  }

  if (expiresAt <= Math.floor(Date.now() / 1000)) {
    throw createHttpError("Sessão expirada. Inicia sessão novamente.", 401);
  }

  return {
    userId,
    role,
    email: normalizeEmail(session.email),
    name: safeText(session.name, 80),
    city: safeText(session.city || "Portugal", 80)
  };
};

const buildAuthResponse = (user, cart = { items: [] }) => ({
  user: publicUser(user),
  cart,
  token: createSessionToken(user)
});

const validateCredentials = ({ email, password }) => {
  if (!isValidEmail(email)) {
    throw createHttpError("Indica um email válido.", 400);
  }

  if (String(password || "").length < 8) {
    throw createHttpError("A palavra-passe deve ter pelo menos 8 caracteres.", 400);
  }
};

const validateAdminRegistration = ({ role, adminCode }) => {
  if (role !== "admin") {
    return;
  }

  const expectedCode = process.env.ADMIN_REGISTRATION_CODE;

  if (!expectedCode || !secureCompare(String(adminCode || ""), expectedCode)) {
    throw createHttpError("O registo de administradores exige um código válido.", 403);
  }
};

const normalizeCartItems = (items) => {
  const grouped = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const productId = Number(item.productId);
    const quantity = Math.max(1, Math.min(99, Number(item.quantity || 1)));

    if (!Number.isFinite(productId)) {
      return;
    }

    grouped.set(productId, (grouped.get(productId) || 0) + quantity);
  });

  return Array.from(grouped, ([productId, quantity]) => ({ productId, quantity: Math.min(99, quantity) }));
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

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createHttpError("Email ou palavra-passe incorretos.", 401);
  }

  return buildAuthResponse(user, { items: runtimeCarts.get(user.id) || [] });
};

const registerRuntime = ({ name, email, password, role, city }) => {
  seedRuntimeUsers();
  const normalizedRole = normalizeRole(role);
  const normalizedEmail = normalizeEmail(email);
  const key = makeRuntimeKey(normalizedEmail, normalizedRole);

  if (runtimeUsers.has(key)) {
    throw createHttpError("Já existe uma conta com esse email e perfil.", 409);
  }

  const user = {
    id: Date.now(),
    name: safeText(name, 80) || (normalizedRole === "admin" ? "Admin ClaveStore" : "Cliente ClaveStore"),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: normalizedRole,
    city: safeText(city, 80) || "Portugal"
  };

  runtimeUsers.set(key, user);
  runtimeCarts.set(user.id, []);

  return buildAuthResponse(user, { items: [] });
};

export const authService = {
  async register(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const role = normalizeRole(payload.role);
    const name = safeText(payload.name, 80) || (role === "admin" ? "Admin ClaveStore" : "Cliente ClaveStore");
    const city = safeText(payload.city, 80) || "Portugal";

    validateCredentials({ email, password });
    validateAdminRegistration({ role, adminCode: payload.adminCode });

    try {
      const workspace = await ensureWorkspace();
      const existing = await models.User.findOne({ where: { email } });

      if (existing) {
        throw createHttpError("Já existe uma conta com esse email.", 409);
      }

      const user = await models.User.create({
        workspaceId: workspace.id,
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        city
      });
      await models.Cart.create({ workspaceId: workspace.id, userId: user.id, items: [] });

      return buildAuthResponse(user, { items: [] });
    } catch (error) {
      if (error.status || !canUseRuntimeFallback()) {
        throw error;
      }

      return registerRuntime({ name, email, password, role, city });
    }
  },

  async login(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const role = normalizeRole(payload.role);

    validateCredentials({ email, password });

    try {
      const user = await models.User.findOne({ where: { email, role }, include: [{ model: models.Cart, as: "cart" }] });

      if (!user || !verifyPassword(password, user.passwordHash)) {
        throw createHttpError("Email ou palavra-passe incorretos.", 401);
      }

      if (passwordNeedsRehash(user.passwordHash)) {
        await user.update({ passwordHash: hashPassword(password) });
      }

      return buildAuthResponse(user, { items: user.cart?.items || [] });
    } catch (error) {
      if (error.status || !canUseRuntimeFallback()) {
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
      if (!canUseRuntimeFallback()) {
        throw error;
      }

      seedRuntimeUsers();
      return { items: runtimeCarts.get(Number(userId)) || [] };
    }
  },

  async saveCart(userId, items) {
    const safeItems = normalizeCartItems(items);

    try {
      const user = await models.User.findByPk(userId);

      if (!user) {
        throw createHttpError("Utilizador não encontrado.", 404);
      }

      const [cart] = await models.Cart.findOrCreate({
        where: { userId },
        defaults: { workspaceId: user.workspaceId, userId, items: safeItems }
      });
      await cart.update({ items: safeItems });
      return { items: safeItems };
    } catch (error) {
      if (error.status || !canUseRuntimeFallback()) {
        throw error;
      }

      seedRuntimeUsers();
      runtimeCarts.set(Number(userId), safeItems);
      return { items: safeItems };
    }
  }
};