// models/Report.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true // Since it's a report for a bar, this can be null
  },
  reportedBarId: {
    type: DataTypes.INTEGER,
    allowNull: true // Allow null because this might be a user report
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Report;
