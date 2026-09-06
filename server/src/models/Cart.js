import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Cart = sequelize.define(
    "Cart",
    {
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      items: {
        type: DataTypes.JSONB,
        defaultValue: []
      }
    },
    {
      tableName: "carts"
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.Workspace, { as: "workspace", foreignKey: "workspaceId" });
    Cart.belongsTo(models.User, { as: "user", foreignKey: "userId" });
  };

  return Cart;
};