// controllers/CrawlController.js
const Crawl = require('../models/Crawl');
const CrawlBar = require('../models/CrawlBar');
const CrawlParticipant = require('../models/CrawlParticipant');
const User = require('../models/User');
const BarSequelize = require('../models/BarSequelize');
const { Op } = require('sequelize');

// GET /api/crawls - Get all crawls for the authenticated user
exports.getCrawls = async (req, res) => {
  try {
    const userId = req.user.id;

    const crawls = await Crawl.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'profileImage']
        },
        {
          model: BarSequelize,
          as: 'Bars',
          through: { attributes: ['order'] },
          attributes: ['id', 'name', 'place_id', 'photos', 'geometry', 'vicinity', 'user_ratings_total', 'price_level']
        },
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(crawls);
  } catch (error) {
    console.error('Error fetching crawls:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET /api/crawls/user/:userId - Get crawls for a specific user
exports.getUserCrawls = async (req, res) => {
  try {
    const { userId } = req.params;

    const crawls = await Crawl.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'profileImage']
        },
        {
          model: BarSequelize,
          as: 'Bars',
          through: { attributes: ['order'] },
          attributes: ['id', 'name', 'place_id', 'photos', 'geometry', 'vicinity', 'user_ratings_total', 'price_level']
        },
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(crawls);
  } catch (error) {
    console.error('Error fetching user crawls:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET /api/crawls/search?searchTerm=:term - Search crawls by name
exports.searchCrawls = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const crawls = await Crawl.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%`
        }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'profileImage']
        },
        {
          model: BarSequelize,
          as: 'Bars',
          through: { attributes: ['order'] },
          attributes: ['id', 'name', 'place_id', 'photos', 'geometry', 'vicinity']
        },
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(crawls);
  } catch (error) {
    console.error('Error searching crawls:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// POST /api/crawls - Create a new crawl
exports.createCrawl = async (req, res) => {
  try {
    const { name, description, barIds, userIds } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !barIds || !Array.isArray(barIds) || barIds.length === 0) {
      return res.status(400).json({ message: 'Name and at least one bar are required' });
    }

    // Create the crawl
    const crawl = await Crawl.create({
      name,
      description,
      userId
    });

    // Add bars to the crawl
    if (barIds && barIds.length > 0) {
      const crawlBars = barIds.map((barId, index) => ({
        crawlId: crawl.id,
        barId: barId,
        order: index
      }));
      await CrawlBar.bulkCreate(crawlBars);
    }

    // Add participants to the crawl (including creator and additional users)
    const participantIds = userIds && Array.isArray(userIds) ? [...new Set([userId, ...userIds])] : [userId];
    const crawlParticipants = participantIds.map(participantId => ({
      crawlId: crawl.id,
      userId: participantId
    }));
    await CrawlParticipant.bulkCreate(crawlParticipants);

    // Fetch the created crawl with all associations
    const createdCrawl = await Crawl.findByPk(crawl.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'profileImage']
        },
        {
          model: BarSequelize,
          as: 'Bars',
          through: { attributes: ['order'] },
          attributes: ['id', 'name', 'place_id', 'photos', 'geometry', 'vicinity']
        },
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email', 'profileImage']
        }
      ]
    });

    res.status(201).json(createdCrawl);
  } catch (error) {
    console.error('Error creating crawl:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = exports;
