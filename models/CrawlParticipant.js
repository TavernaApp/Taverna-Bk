// models/CrawlParticipant.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CrawlParticipant = sequelize.define('CrawlParticipant', {
  crawlId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Crawls',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = CrawlParticipant;
