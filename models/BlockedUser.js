// models/BlockedUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlockedUser = sequelize.define('BlockedUser', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blockedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = BlockedUser;
