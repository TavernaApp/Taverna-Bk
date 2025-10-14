// models/Crawl.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const BarSequelize = require('./BarSequelize');
const CrawlBar = require('./CrawlBar');
const CrawlParticipant = require('./CrawlParticipant');

const Crawl = sequelize.define('Crawl', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId'
  }
});

// Define associations
Crawl.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
User.hasMany(Crawl, { foreignKey: 'userId' });

Crawl.belongsToMany(BarSequelize, {
  through: CrawlBar,
  foreignKey: 'crawlId',
  as: 'Bars'
});
BarSequelize.belongsToMany(Crawl, {
  through: CrawlBar,
  foreignKey: 'barId',
  as: 'Crawls'
});

Crawl.belongsToMany(User, {
  through: CrawlParticipant,
  foreignKey: 'crawlId',
  as: 'participants'
});
User.belongsToMany(Crawl, {
  through: CrawlParticipant,
  foreignKey: 'userId',
  as: 'participatedCrawls'
});

module.exports = Crawl;
