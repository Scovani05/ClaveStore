import "dotenv/config";
import { sequelize, models } from "../models/index.js";
import { hashPassword } from "../services/authService.js";
import { getSampleDashboard } from "../services/sampleData.js";

const seed = async () => {
  const dashboard = getSampleDashboard();

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  await models.OrderItem.destroy({ where: {} });
  await models.Order.destroy({ where: {} });
  await models.Cart.destroy({ where: {} });
  await models.User.destroy({ where: {} });
  await models.Product.destroy({ where: {} });
  await models.Workspace.destroy({ where: {} });

  const workspace = await models.Workspace.create(dashboard.workspace);

  const cliente = await models.User.create({
    workspaceId: workspace.id,
    name: "Cliente ClaveStore",
    email: "cliente@clavestore.pt",
    passwordHash: hashPassword("cliente123"),
    role: "client",
    city: "Viseu"
  });

  await models.User.create({
    workspaceId: workspace.id,
    name: "Paulo Admin",
    email: "admin@clavestore.pt",
    passwordHash: hashPassword("admin123"),
    role: "admin",
    city: "Viseu"
  });

  await models.Cart.create({
    workspaceId: workspace.id,
    userId: cliente.id,
    items: [{ productId: 101, quantity: 1 }]
  });

  await Promise.all(
    dashboard.products.map((product) =>
      models.Product.create({
        ...product,
        workspaceId: workspace.id
      })
    )
  );

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

  console.log("ClaveStore PT seed concluído.");
  await sequelize.close();
};

seed().catch(async (error) => {
  console.error("Erro ao popular a base de dados", error);
  await sequelize.close();
  process.exit(1);
});