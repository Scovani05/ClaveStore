import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("client", "admin"),
        allowNull: false,
        defaultValue: "client"
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: "Portugal"
      }
    },
    {
      tableName: "users"
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Workspace, { as: "workspace", foreignKey: "workspaceId" });
    User.hasOne(models.Cart, { as: "cart", foreignKey: "userId" });
    User.hasMany(models.Order, { as: "orders", foreignKey: "userId" });
  };

  return User;
};