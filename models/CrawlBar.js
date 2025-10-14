// models/CrawlBar.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CrawlBar = sequelize.define('CrawlBar', {
  crawlId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Crawls',
      key: 'id'
    }
  },
  barId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Bars',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
});

module.exports = CrawlBar;
