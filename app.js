require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module

const userRoutes = require('./routes/userRoutes');
const barRoutes = require('./routes/barRoutes');
const ratingRoutes = require('./routes/ratingRoutes'); // Import rating routes
const blockedRoutes = require('./routes/blockedRoutes');
const reportedRoutes = require('./routes/reportedRoutes');
const sequelize = require('./config/database');

const app = express();

app.use(bodyParser.json());
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api', userRoutes,barRoutes,ratingRoutes,blockedRoutes,reportedRoutes);


const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Sync Sequelize Models with Database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});
