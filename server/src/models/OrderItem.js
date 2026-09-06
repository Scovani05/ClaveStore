import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      unitPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    },
    {
      tableName: "order_items"
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { as: "order", foreignKey: "orderId" });
    OrderItem.belongsTo(models.Product, { as: "product", foreignKey: "productId" });
  };

  return OrderItem;
};