import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Workspace = sequelize.define(
    "Workspace",
    {
      storeName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ClaveStore PT"
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Paulo Monteiro"
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ola@clavestore.pt",
        validate: {
          isEmail: true
        }
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Viseu"
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: "Portugal"
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "EUR"
      },
      taxRate: {
        type: DataTypes.FLOAT,
        defaultValue: 23
      },
      freeShippingThreshold: {
        type: DataTypes.FLOAT,
        defaultValue: 250
      },
      plan: {
        type: DataTypes.STRING,
        defaultValue: "Loja Pro"
      }
    },
    {
      tableName: "workspaces"
    }
  );

  Workspace.associate = (models) => {
    Workspace.hasMany(models.User, { as: "users", foreignKey: "workspaceId" });
    Workspace.hasMany(models.Cart, { as: "carts", foreignKey: "workspaceId" });
    Workspace.hasMany(models.Product, { as: "products", foreignKey: "workspaceId" });
    Workspace.hasMany(models.Order, { as: "orders", foreignKey: "workspaceId" });
  };

  return Workspace;
};