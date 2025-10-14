// controllers/BarController.js

const axios = require('axios');
const BarSequelize = require('../models/BarSequelize'); // Import the Bar model/schema
const Rating = require('../models/Rating');
const User = require('../models/User');

exports.getBars = async (req, res) => {
  try {
    const { pagetoken } = req.query;
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.0902,-95.7129&radius=5000000&type=bar&key=AIzaSyDxx2oXSM9zhlBb3h1UoEfBjSzTWY1yt7A`;

    if (pagetoken) {
      url += `&pagetoken=${pagetoken}`;
    }

    const response = await axios.get(url);
    const bars = response.data.results;
    const nextPageToken = response.data.next_page_token;

    // Save data to database
    for (const bar of bars) {
      await BarSequelize.findOrCreate({
        where: { reference: bar.reference },
        defaults: bar
      });
    }

    const barsWithRatings = await Promise.all(bars.map(async (bar) => {
      const dbBar = await BarSequelize.findOne({ where: { reference: bar.reference } });
      if (dbBar) {
        const ratings = await Rating.findAll({ where: { BarId: dbBar.id }, include: [User] });
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
        const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
        return { ...dbBar.toJSON(), ratings, averageRating, totalRatings };
      }
      return null;
    }));

    res.json({ bars: barsWithRatings, nextPageToken });
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ message: 'Error fetching bars' });
  }
};

// exports.getBars = async (req, res) => {
//   try {
//     const { pagetoken } = req.query;
//     let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.0902,-95.7129&radius=5000000&type=bar&key=AIzaSyDxx2oXSM9zhlBb3h1UoEfBjSzTWY1yt7A`;

//     if (pagetoken) {
//       url += `&pagetoken=${pagetoken}`;
//     }

//     const response = await axios.get(url);
//     const bars = response.data.results;
//     const nextPageToken = response.data.next_page_token;

//  // Save data to database
// for (const bar of bars) {
//   // Filter out unrecognized attributes
//   const { icon_mask_base_uri, opening_hours, photos, place_id, plus_code, price_level, rating, types, ...filteredDefaults } = bar;
  
//   const [dbBar, created] = await BarSequelize.findOrCreate({
//     where: { reference: bar.reference },
//     defaults: filteredDefaults
//   });

//   if (created || dbBar) {
//     // Logic to handle when a new instance is created or existing instance is found
//     console.log('Bar saved:', dbBar.toJSON());
//   } else {
//     // Handle the case where neither a new instance was created nor an existing one was found
//     console.log('Error saving bar:', bar);
//   }
// }


//     const barsWithRatings = await Promise.all(bars.map(async (bar) => {
//       const dbBar = await BarSequelize.findOne({ where: { reference: bar.reference } });
//       if (dbBar) {
//         const ratings = await Rating.findAll({ where: { BarId: dbBar.id }, include: [User] });
//         const totalRatings = ratings.length;
//         const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
//         const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
//         return { ...dbBar.toJSON(), ratings, averageRating, totalRatings };
//       }
//       return null;
//     }));

//     res.json({ bars: barsWithRatings, nextPageToken });
//   } catch (error) {
//     console.error('Error fetching bars:', error);
//     res.status(500).json({ message: 'Error fetching bars' });
//   }
// };



// Get all bars

exports.getAllBars = async (req, res) => {
  try {
    const bars = await BarSequelize.findAll();
    // Fetch ratings and user information for each bar
    const barsWithRatings = await Promise.all(bars.map(async (bar) => {
      const ratings = await Rating.findAll({ where: { barId: bar.id }, include: [User] });
      const totalRatings = ratings.length;
      const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0); // Calculate sum of all ratings
      const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Calculate average rating
      return { ...bar.toJSON(), ratings, averageRating, totalRatings };
    }));
    res.json(barsWithRatings);
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ message: 'Error fetching bars' });
  }
};
// Function to create a new bar
exports.createBar = async (req, res) => {
  try {
    // Extract necessary data from request body
    const { name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity } = req.body;

    // Create the bar in the database
    const newBar = await BarSequelize.create({
      name,
      business_status,
      geometry,
      icon,
      icon_background_color,
      rating,
      reference,
      scope,
      user_ratings_total,
      vicinity
    });

    // Send response with the newly created bar
    res.status(201).json(newBar);
  } catch (error) {
    console.error('Error creating bar:', error);
    res.status(500).json({ message: 'Error creating bar' });
  }
};
// Get a single bar by ID
exports.getBarById = async (req, res) => {
  try {
    const { id } = req.params;
    const bar = await BarSequelize.findByPk(id);
    if (bar) {
      res.json(bar);
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error fetching bar:', error);
    res.status(500).json({ message: 'Error fetching bar' });
  }
};

// Update a bar
exports.updateBar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity } = req.body;
    const [updated] = await BarSequelize.update({ name, business_status, geometry, icon, icon_background_color, rating, reference, scope, user_ratings_total, vicinity }, { where: { id } });
    if (updated) {
      const updatedBar = await BarSequelize.findByPk(id);
      res.json(updatedBar);
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error updating bar:', error);
    res.status(500).json({ message: 'Error updating bar' });
  }
};

// Delete a bar
exports.deleteBar = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BarSequelize.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: 'Bar deleted successfully' });
    } else {
      res.status(404).json({ message: 'Bar not found' });
    }
  } catch (error) {
    console.error('Error deleting bar:', error);
    res.status(500).json({ message: 'Error deleting bar' });
  }
};

// Search bars by query
exports.searchBars = async (req, res) => {
  try {
    const { query } = req.body;

    // TODO: Implement bar search functionality
    // - Search bars by name, vicinity, or other relevant fields
    // - Use Sequelize operators like Op.iLike or Op.like for pattern matching
    // - Consider integrating Google Places Text Search API if needed

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Placeholder implementation - returns empty array
    const bars = [];

    res.json({
      bars,
      query,
      message: 'Search functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error searching bars:', error);
    res.status(500).json({ message: 'Error searching bars' });
  }
};

// Search bars and users
exports.searchBarsAndUsers = async (req, res) => {
  try {
    const { query } = req.body;

    // TODO: Implement combined bar and user search functionality
    // - Search both bars and users by query string
    // - Return combined results with type indicators
    // - Consider relevance scoring and result ordering

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Placeholder implementation - returns empty arrays
    const bars = [];
    const users = [];

    res.json({
      bars,
      users,
      query,
      message: 'Combined search functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error searching bars and users:', error);
    res.status(500).json({ message: 'Error searching bars and users' });
  }
};

// Get bars by live location
exports.getBarsByLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;

    // TODO: Implement live location-based bar search
    // - Use latitude and longitude to find nearby bars
    // - Implement radius-based filtering (default to 5km if not provided)
    // - Consider using Google Places Nearby Search API
    // - Or implement custom distance calculation using Haversine formula
    // - Sort results by distance from user location

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Placeholder implementation - returns empty array
    const bars = [];

    res.json({
      bars,
      location: { latitude, longitude, radius: radius || 5000 },
      message: 'Live location search functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching bars by location:', error);
    res.status(500).json({ message: 'Error fetching bars by location' });
  }
};

// Get popular bars
exports.getPopularBars = async (req, res) => {
  try {
    // TODO: Implement popular bars functionality
    // - Define criteria for "popular" (e.g., most ratings, highest average rating, most visits)
    // - Consider time-based popularity (trending bars)
    // - Add pagination support
    // - Include rating statistics in response

    const { limit = 10 } = req.query;

    // Placeholder implementation - returns empty array
    const bars = [];

    res.json({
      bars,
      limit: parseInt(limit),
      message: 'Popular bars functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching popular bars:', error);
    res.status(500).json({ message: 'Error fetching popular bars' });
  }
};

// Get ratings for a specific bar
exports.getBarRatings = async (req, res) => {
  try {
    const { barId } = req.params;

    // TODO: Implement bar ratings retrieval
    // - Fetch all ratings for the specified bar
    // - Include user information with each rating
    // - Calculate average rating and total count
    // - Add pagination support for large numbers of ratings
    // - Consider sorting options (most recent, highest/lowest rated)

    if (!barId) {
      return res.status(400).json({ message: 'Bar ID is required' });
    }

    // Placeholder implementation
    const ratings = [];
    const averageRating = 0;
    const totalRatings = 0;

    res.json({
      barId,
      ratings,
      averageRating,
      totalRatings,
      message: 'Bar ratings functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching bar ratings:', error);
    res.status(500).json({ message: 'Error fetching bar ratings' });
  }
};

// Log bar visit
exports.logBarVisit = async (req, res) => {
  try {
    const { barId } = req.params;
    const { userId, timestamp, duration } = req.body;

    // TODO: Implement bar visit logging functionality
    // - Create a Visit model/table to track user visits
    // - Record bar ID, user ID, timestamp, and optional duration
    // - Use this data for analytics and popular bars calculation
    // - Consider implementing check-in/check-out functionality
    // - Add validation to prevent duplicate visits

    if (!barId) {
      return res.status(400).json({ message: 'Bar ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Placeholder implementation
    const visit = {
      barId,
      userId,
      timestamp: timestamp || new Date(),
      duration: duration || null,
      message: 'Visit logged successfully (placeholder)'
    };

    res.status(201).json({
      visit,
      message: 'Bar visit logging functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error logging bar visit:', error);
    res.status(500).json({ message: 'Error logging bar visit' });
  }
};