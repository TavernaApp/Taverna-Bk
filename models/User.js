// models/User.js
const Rating = require('./Rating');
const BlockedUser = require('./BlockedUser');
const Report = require('./Report');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING // Or whatever data type suits your needs
  }
  
});
// Define associations for followers and following
User.belongsToMany(User, { as: 'followers', through: 'UserFollow', foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'following', through: 'UserFollow', foreignKey: 'followerId' });

User.hasMany(Rating);
Rating.belongsTo(User);

// Define associations for blocked users
User.hasMany(BlockedUser, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Define associations for reported users
User.hasMany(Report, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = User;

