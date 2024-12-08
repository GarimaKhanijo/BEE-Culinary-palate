const express = require('express');//server side 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const authMiddleware = require('../../authMiddleware');
const User = require('../../models/user.model.js');
const Recipe = require('../../models/recipe.model.js');
const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email: email, deleted_at: null }); // Find user by email
    if (existingUser) {
        return res.status(400).json({ redirectToLogin: true });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    //if user email exists but deleted_at is not null
    let savedUser = await User.findOneAndUpdate({ email: email },
        {
            $set:
            {
                deleted_at: null,
                password: hashedPassword
            }
        });
    if (!savedUser) {
        // Create new user with an empty likedRecipes array
        const newUser = new User({
            email: email,
            password: hashedPassword,
            likedRecipes: [],
            deleted_at: null
        });

        // Save the user to the database
        savedUser = await newUser.save();
    }
    if (savedUser && savedUser._id) {
        console.log('User stored successfully:', savedUser);
        res.status(201).json({ token: jwt.sign({ id: savedUser._id, email }, SECRET_KEY) });
    }
    else {
        return res.status(400).json({ error: "Registration Failed" });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }); // Find user by email
    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);  // Compare hashed password
        if (passwordMatch) {
            res.json({ token: jwt.sign({ id: user._id, email }, SECRET_KEY) });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } else {
        res.status(401).json({ error: 'No User Found' });
    }
});


module.exports = router;
