const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming User schema is in models/User.js
const router = express.Router();

// Register API

exports.register = async (req, res) => {
    
    const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Create JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.privateKey, { expiresIn: '12h' });

    res.status(201).json({ success: true, token,message:"register succesfull"  });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}



// Login API
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email ' });
      }
  
      // Compare provided password with stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid   password' });
      }
  
      // Create JWT token
      const token = jwt.sign({ userId: user._id }, process.env.privateKey, { expiresIn: '12h' });
  
      res.json({ success: true, token,message:"login succesfull" });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
