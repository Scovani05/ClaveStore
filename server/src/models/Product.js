import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      condition: {
        type: DataTypes.STRING,
        defaultValue: "Novo"
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      compareAtPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      reorderPoint: {
        type: DataTypes.INTEGER,
        defaultValue: 2
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 4.5
      },
      reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      badge: {
        type: DataTypes.STRING,
        defaultValue: "Novo"
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      specs: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      gallery: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      comments: {
        type: DataTypes.JSONB,
        defaultValue: []
      }
    },
    {
      tableName: "products"
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Workspace, { as: "workspace", foreignKey: "workspaceId" });
    Product.hasMany(models.OrderItem, { as: "orderItems", foreignKey: "productId" });
  };

  return Product;
};