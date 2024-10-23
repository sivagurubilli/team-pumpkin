const express = require('express');
const { createTrip, deleteTrip,getTrips } = require('../controllers/tripController');
const authenticateToken = require('../middlewares/authmiddleware');
const { register, login } = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const upload = multer(); 
// Create a trip
router.post('/createtrips',upload.single('file'),  createTrip);

// Get trips for a user
router.get('/trips/:id?',authenticateToken, getTrips);
router.post('/register', register);
router.post('/login', login);

router.delete('/deletetrips/:id?',authenticateToken, deleteTrip);
router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'Welcome to the dashboard' });
  });
  
module.exports = router;
