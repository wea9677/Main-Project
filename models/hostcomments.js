'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class hostcomments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    hostcomments.belongsTo(models.hosts, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });    
    }
  }
  hostcomments.init({
    reviewId : {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: DataTypes.INTEGER,
    hostId: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    review: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'hostcomments',
  });
  return hostcomments;
};