import { Op } from "sequelize";
import models, { sequelize } from "../models/index.js";
import { getSampleDashboard } from "./sampleData.js";

const number = (value) => Number(value || 0);

const clone = (value) => JSON.parse(JSON.stringify(value));

const calcIncludedTax = (subtotal, rate = 23) => Number((subtotal - subtotal / (1 + number(rate) / 100)).toFixed(2));

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const computeStats = (products, orders, baseStats = {}) => {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const revenue = activeOrders.reduce((sum, order) => sum + number(order.total), 0);
  const unitsSold = activeOrders.reduce(
    (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + number(item.quantity), 0),
    0
  );
  const visitorSessions = number(baseStats.visitorSessions || 4200);

  return {
    ...baseStats,
    products: products.length,
    activeProducts: products.filter((product) => number(product.stock) > 0).length,
    stockValue: products.reduce((sum, product) => sum + number(product.price) * number(product.stock), 0),
    lowStock: products.filter((product) => number(product.stock) <= number(product.reorderPoint)).length,
    orders: orders.length,
    revenue,
    avgTicket: activeOrders.length ? Number((revenue / activeOrders.length).toFixed(2)) : 0,
    pendingOrders: orders.filter((order) => ["pending", "paid", "processing"].includes(order.status)).length,
    unitsSold,
    visitorSessions,
    conversionRate: visitorSessions ? Number(((activeOrders.length / visitorSessions) * 100).toFixed(2)) : 0
  };
};

const fallbackProductImage = "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80";


const normalizeSpecs = (specs) =>
  Array.isArray(specs)
    ? specs
    : String(specs || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const normalizeProductPayload = (payload, workspaceId) => {
  const imageUrl = payload.imageUrl || fallbackProductImage;
  const gallery = Array.isArray(payload.gallery) ? payload.gallery.filter(Boolean) : [];

  return {
    workspaceId,
    sku: payload.sku || `CLV-${Date.now().toString().slice(-6)}`,
    name: payload.name || "Novo artigo musical",
    brand: payload.brand || "ClaveStore",
    category: payload.category || "Acessórios",
    condition: payload.condition || "Novo",
    price: number(payload.price),
    compareAtPrice: number(payload.compareAtPrice || number(payload.price) + 20),
    stock: number(payload.stock),
    reorderPoint: number(payload.reorderPoint || 2),
    rating: number(payload.rating || 4.5),
    reviews: number(payload.reviews || 0),
    badge: payload.badge || "Novo",
    isFeatured: Boolean(payload.isFeatured),
    imageUrl,
    shortDescription: payload.shortDescription || "Artigo musical pronto para venda online.",
    specs: normalizeSpecs(payload.specs),
    gallery: gallery.length ? gallery : [imageUrl],
    comments: Array.isArray(payload.comments) ? payload.comments : []
  };
};
const applyProductFilters = (products, query = {}) => {
  const category = query.category;
  const search = normalizeText(query.search || "");

  return products.filter((product) => {
    const matchesCategory = !category || category === "Todos" || product.category === category;
    const commentText = (product.comments || []).map((comment) => `${comment.title} ${comment.body} ${comment.city}`).join(" ");
    const haystack = normalizeText(`${product.name} ${product.brand} ${product.category} ${product.shortDescription} ${(product.specs || []).join(" ")} ${commentText}`);
    return matchesCategory && (!search || haystack.includes(search));
  });
};

const ensureWorkspace = async () => {
  const sample = getSampleDashboard();
  const [workspace] = await models.Workspace.findOrCreate({
    where: { id: sample.workspace.id },
    defaults: sample.workspace
  });
  return workspace;
};

const getDbDashboard = async () => {
  const sample = getSampleDashboard();
  const workspace = await models.Workspace.findOne({ order: [["id", "ASC"]] });
  const products = await models.Product.findAll({ order: [["isFeatured", "DESC"], ["rating", "DESC"], ["name", "ASC"]] });
  const orders = await models.Order.findAll({
    include: [{ model: models.OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]]
  });

  if (!workspace || products.length === 0) {
    throw new Error("Database has no ClaveStore data yet");
  }

  const plainProducts = products.map((product) => product.toJSON());
  const plainOrders = orders.map((order) => order.toJSON());

  return {
    ...sample,
    workspace: workspace.toJSON(),
    categories: [...new Set(plainProducts.map((product) => product.category))],
    products: plainProducts,
    orders: plainOrders,
    stats: computeStats(plainProducts, plainOrders, sample.stats),
    meta: {
      ...sample.meta,
      source: "database",
      generatedAt: new Date().toISOString()
    }
  };
};

const getDemoDashboard = () => {
  const sample = getSampleDashboard();
  return {
    ...sample,
    stats: computeStats(sample.products, sample.orders, sample.stats),
    meta: {
      ...sample.meta,
      source: "demo",
      generatedAt: new Date().toISOString()
    }
  };
};

const buildOrderDraft = (payload, products, workspace) => {
  const requestedItems = Array.isArray(payload.items) ? payload.items : [];

  if (!requestedItems.length) {
    const error = new Error("Adiciona pelo menos um produto à encomenda.");
    error.status = 400;
    throw error;
  }

  const items = requestedItems.map((requested) => {
    const product = products.find((item) => Number(item.id) === Number(requested.productId));

    if (!product) {
      const error = new Error("Produto não encontrado.");
      error.status = 404;
      throw error;
    }

    const quantity = Math.max(1, number(requested.quantity));

    if (number(product.stock) < quantity) {
      const error = new Error(`${product.name} não tem stock suficiente.`);
      error.status = 422;
      throw error;
    }

    const unitPrice = number(product.price);
    return {
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice,
      total: Number((unitPrice * quantity).toFixed(2))
    };
  });

  const subtotal = items.reduce((sum, item) => sum + number(item.total), 0);
  const shipping = subtotal >= number(workspace.freeShippingThreshold || 250) ? 0 : 6;

  return {
    workspaceId: workspace.id,
    userId: payload.userId || null,
    customerName: payload.customerName || "Cliente ClaveStore",
    email: payload.email || "cliente@example.com",
    city: payload.city || "Portugal",
    status: payload.status || "paid",
    paymentMethod: payload.paymentMethod || "MB Way",
    subtotal,
    tax: calcIncludedTax(subtotal, workspace.taxRate),
    shipping,
    total: Number((subtotal + shipping).toFixed(2)),
    items
  };
};

export const musicStoreService = {
  async getDashboard() {
    try {
      return await getDbDashboard();
    } catch (error) {
      return getDemoDashboard();
    }
  },

  async getWorkspace() {
    try {
      const workspace = await models.Workspace.findOne({ order: [["id", "ASC"]] });
      return workspace?.toJSON() || getSampleDashboard().workspace;
    } catch (error) {
      return getSampleDashboard().workspace;
    }
  },

  async listCategories() {
    try {
      const categories = await models.Product.findAll({ attributes: ["category"], group: ["category"], order: [["category", "ASC"]] });
      return categories.map((item) => item.category);
    } catch (error) {
      return getSampleDashboard().categories;
    }
  },

  async listProducts(query = {}) {
    try {
      const where = {};
      if (query.category && query.category !== "Todos") {
        where.category = query.category;
      }
      if (query.search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${query.search}%` } },
          { brand: { [Op.iLike]: `%${query.search}%` } },
          { shortDescription: { [Op.iLike]: `%${query.search}%` } }
        ];
      }

      const products = await models.Product.findAll({ where, order: [["isFeatured", "DESC"], ["rating", "DESC"]] });
      return products.map((product) => product.toJSON());
    } catch (error) {
      return applyProductFilters(getSampleDashboard().products, query);
    }
  },

  async createProduct(payload) {
    try {
      const workspace = await ensureWorkspace();
      const product = await models.Product.create(normalizeProductPayload(payload, workspace.id));
      return product.toJSON();
    } catch (error) {
      return {
        id: payload.id || Date.now(),
        ...normalizeProductPayload(payload, getSampleDashboard().workspace.id)
      };
    }
  },

  async updateProduct(productId, payload) {
    try {
      const product = await models.Product.findByPk(productId);

      if (!product) {
        const error = new Error("Produto não encontrado.");
        error.status = 404;
        throw error;
      }

      await product.update(payload);
      return product.toJSON();
    } catch (error) {
      if (error.status) {
        throw error;
      }

      return { id: Number(productId), ...payload };
    }
  },

  async listOrders() {
    try {
      const orders = await models.Order.findAll({ include: [{ model: models.OrderItem, as: "items" }], order: [["createdAt", "DESC"]] });
      return orders.map((order) => order.toJSON());
    } catch (error) {
      return getSampleDashboard().orders;
    }
  },

  async createOrder(payload) {
    try {
      return await sequelize.transaction(async (transaction) => {
        const workspace = await ensureWorkspace();
        const productIds = payload.items.map((item) => item.productId);
        const productRows = await models.Product.findAll({ where: { id: productIds }, transaction });
        const draft = buildOrderDraft(payload, productRows.map((product) => product.toJSON()), workspace.toJSON());
        const order = await models.Order.create(draft, { transaction });

        await Promise.all(
          draft.items.map(async (item) => {
            await models.OrderItem.create({ ...item, orderId: order.id }, { transaction });
            const product = productRows.find((row) => Number(row.id) === Number(item.productId));
            await product.update({ stock: Math.max(0, number(product.stock) - item.quantity) }, { transaction });
          })
        );

        const savedOrder = await models.Order.findByPk(order.id, {
          include: [{ model: models.OrderItem, as: "items" }],
          transaction
        });
        return savedOrder.toJSON();
      });
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const sample = getSampleDashboard();
      const draft = buildOrderDraft(payload, sample.products, sample.workspace);
      return { id: payload.id || Date.now(), createdAt: new Date().toISOString(), ...draft };
    }
  },

  async updateOrder(orderId, payload) {
    try {
      const order = await models.Order.findByPk(orderId, { include: [{ model: models.OrderItem, as: "items" }] });

      if (!order) {
        const error = new Error("Encomenda não encontrada.");
        error.status = 404;
        throw error;
      }

      await order.update(payload);
      return order.toJSON();
    } catch (error) {
      if (error.status) {
        throw error;
      }

      return { id: Number(orderId), ...payload };
    }
  }
};