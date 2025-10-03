// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const multer = require('multer'); // Import multer module
const authenticateUser = require('../middleware/authenticationMiddleware');

// Define storage for the uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Specify the folder where uploaded images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename for the uploaded image
  }
});
// Initialize multer with the storage options
const upload = multer({ storage: storage });
router.get('/users', UserController.getAllUsers);
router.post('/users', UserController.createUser);
router.post('/users/login',UserController.loginUser); // New endpoint for login
router.post('/users/signout', authenticateUser, UserController.signoutUser);
// Define the route for changing passwords
router.put('/users/change-password/:id', authenticateUser, UserController.changePassword);
router.put('/users/change-email/:id', authenticateUser, UserController.changeEmail);


router.post('/users/upload-profile-image', authenticateUser, upload.single('profileImage'), UserController.uploadProfileImage);
router.get('/users/:id/profile', authenticateUser, UserController.getUserProfile);

router.put('/users/:id',authenticateUser, UserController.updateUser);
router.delete('/users/:id',authenticateUser, UserController.deleteUser);
router.post('/users/follow/:userId',authenticateUser,UserController.followUser);
router.delete('/users/unfollow/:userId',authenticateUser,UserController.unfollowUser);

module.exports = router;
