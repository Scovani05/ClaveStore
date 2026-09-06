import "dotenv/config";
import { sequelize, models } from "../models/index.js";
import { hashPassword } from "../services/authService.js";
import { getSampleDashboard } from "../services/sampleData.js";

const seed = async () => {
  const dashboard = getSampleDashboard();

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const [workspace] = await models.Workspace.findOrCreate({
    where: { id: dashboard.workspace.id },
    defaults: dashboard.workspace
  });
  await workspace.update(dashboard.workspace);

  const [cliente, clienteCreated] = await models.User.findOrCreate({
    where: { email: "cliente@clavestore.pt" },
    defaults: {
      workspaceId: workspace.id,
      name: "Cliente ClaveStore",
      email: "cliente@clavestore.pt",
      passwordHash: hashPassword("cliente123"),
      role: "client",
      city: "Viseu"
    }
  });

  if (!clienteCreated) {
    await cliente.update({
      workspaceId: workspace.id,
      name: "Cliente ClaveStore",
      role: "client",
      city: "Viseu"
    });
  }

  const [admin, adminCreated] = await models.User.findOrCreate({
    where: { email: "admin@clavestore.pt" },
    defaults: {
      workspaceId: workspace.id,
      name: "Paulo Admin",
      email: "admin@clavestore.pt",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      city: "Viseu"
    }
  });

  if (!adminCreated) {
    await admin.update({
      workspaceId: workspace.id,
      name: "Paulo Admin",
      role: "admin",
      city: "Viseu"
    });
  }

  await models.Cart.findOrCreate({
    where: { userId: cliente.id },
    defaults: {
      workspaceId: workspace.id,
      userId: cliente.id,
      items: [{ productId: 101, quantity: 1 }]
    }
  });

  await Promise.all(
    dashboard.products.map(async (product) => {
      const { id, ...productData } = product;
      const [storedProduct, created] = await models.Product.findOrCreate({
        where: { sku: product.sku },
        defaults: {
          id,
          ...productData,
          workspaceId: workspace.id
        }
      });

      if (!created) {
        await storedProduct.update({
          ...productData,
          workspaceId: workspace.id
        });
      }
    })
  );

  const existingOrders = await models.Order.count({ where: { workspaceId: workspace.id } });

  if (existingOrders === 0) {
    for (const order of dashboard.orders) {
      const createdOrder = await models.Order.create({
        workspaceId: workspace.id,
        userId: cliente.id,
        customerName: order.customerName,
        email: order.email,
        city: order.city,
        status: order.status,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.createdAt
      });

      await Promise.all(
        order.items.map((item) =>
          models.OrderItem.create({
            ...item,
            orderId: createdOrder.id
          })
        )
      );
    }
  }

  await sequelize.query("SELECT setval(pg_get_serial_sequence('workspaces', 'id'), COALESCE((SELECT MAX(id) FROM workspaces), 1))");
  await sequelize.query("SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1))");

  console.log("ClaveStore PT seed concluído.");
  await sequelize.close();
};

seed().catch(async (error) => {
  console.error("Erro ao popular a base de dados", error);
  await sequelize.close();
  process.exit(1);
});
