import { Sequelize } from "sequelize";
import { databaseConfig } from "../config/database.js";
import CartModel from "./Cart.js";
import OrderModel from "./Order.js";
import OrderItemModel from "./OrderItem.js";
import ProductModel from "./Product.js";
import UserModel from "./User.js";
import WorkspaceModel from "./Workspace.js";

const fallbackUrl = "postgres://postgres:postgres@localhost:5432/clavestorept";

export const sequelize = new Sequelize(databaseConfig.url || fallbackUrl, databaseConfig.options);

export const models = {
  Workspace: WorkspaceModel(sequelize),
  User: UserModel(sequelize),
  Cart: CartModel(sequelize),
  Product: ProductModel(sequelize),
  Order: OrderModel(sequelize),
  OrderItem: OrderItemModel(sequelize)
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export default models;