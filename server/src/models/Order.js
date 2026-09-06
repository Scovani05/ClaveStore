import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "paid"
      },
      paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: "MB Way"
      },
      subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      tax: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      shipping: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    },
    {
      tableName: "orders"
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Workspace, { as: "workspace", foreignKey: "workspaceId" });
    Order.belongsTo(models.User, { as: "user", foreignKey: "userId" });
    Order.hasMany(models.OrderItem, { as: "items", foreignKey: "orderId" });
  };

  return Order;
};