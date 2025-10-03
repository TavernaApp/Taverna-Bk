const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rating = require('./Rating');
const User = require('./User');
const BarSequelize = sequelize.define('Bar', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  business_status: {
    type: DataTypes.STRING(255)
  },
  geometry: {
    type: DataTypes.JSON// Use DataTypes.JSON instead of DataTypes.JSONB
  },
  icon: {
    type: DataTypes.STRING
  },
  icon_background_color: {
    type: DataTypes.STRING
  },
  icon_mask_base_uri: {
    type: DataTypes.STRING
  },
  opening_hours: {
    type: DataTypes.JSON
  },
  photos: {
    type: DataTypes.JSON
  },
  place_id: {
    type: DataTypes.STRING
  },
  plus_code: {
    type: DataTypes.JSON
  },
  price_level: {
    type: DataTypes.INTEGER
  },
  // rating: {
  //   type: DataTypes.FLOAT
  // },
  reference: {
    type: DataTypes.STRING
  },
  scope: {
    type: DataTypes.STRING
  },
  types: {
    type: DataTypes.JSON
  },
  user_ratings_total: {
    type: DataTypes.INTEGER
  },
  vicinity: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});
BarSequelize.hasMany(Rating); // Establishing the association between Bar and Rating
Rating.belongsTo(BarSequelize);

Rating.belongsTo(User);
User.hasMany(Rating);
// Define hooks
BarSequelize.addHook('afterSave', async (bar, options) => {
  try {
    const barId = bar.id;
    const [result] = await Rating.aggregate('rating', 'avg', { where: { BarId: barId } });
    const averageRating = result || 0;
    await BarSequelize.update({ rating: averageRating }, { where: { id: barId } });
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
});
module.exports = BarSequelize;
