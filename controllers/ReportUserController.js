// // controllers/ReportUserController.js
// const Report = require('../models/Report');

// exports.reportUser = async (req, res) => {
//   try {
//     const { reporterId } = req.params;
//     const { reportedUserId, reason, description } = req.body;

//     // Create a new Report record
//     await Report.create({ reporterId, reportedUserId, reason, description });

//     res.status(201).json({ message: 'User reported successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// exports.reportBar = async (req, res) => {
//   try {
//     const { userId, barId } = req.params;
//     const { reason, description } = req.body;

//     // Create a new Report record for bar
//     await Report.create({ reporterId: userId, reportedBarId: barId, reason, description });

//     res.status(201).json({ message: 'Bar reported successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

const Report = require('../models/Report');
const User = require('../models/User');
const Bar = require('../models/BarSequelize');

exports.reportUser = async (req, res) => {
  try {
    const { reporterId } = req.params;
    const { reportedUserId, reason, description } = req.body;

    // Create a new Report record
    const report = await Report.create({ reporterId, reportedUserId, reason, description });

    // Fetch information about the reporter and the reported user
    const reporter = await User.findByPk(reporterId);
    const reportedUser = await User.findByPk(reportedUserId);

    res.status(201).json({ 
      message: 'User reported successfully',
      reporter,
      reportedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.reportBar = async (req, res) => {
  try {
    const { userId, barId } = req.params;
    const { reason, description } = req.body;

    // Create a new Report record for bar
    const report = await Report.create({ reporterId: userId, reportedBarId: barId, reason, description });

    // Fetch information about the reporter and the reported bar
    const reporter = await User.findByPk(userId);
    const reportedBar = await Bar.findByPk(barId);

    res.status(201).json({ 
      message: 'Bar reported successfully',
      reporter,
      reportedBar
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
