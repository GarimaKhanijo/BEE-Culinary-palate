const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const authMiddleware = require('../../authMiddleware');
const router = express.Router();
const Recipe = require('../../models/recipe.model.js');
const User = require('../../models/user.model.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../images'));
    },
    filename: (req, file, cb) => {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});
const upload = multer({ storage });

// Get all recipes
router.get('/', async (req, res) => {
    const recipes = await Recipe.find({ deleted_at: null }); // Retrieves all recipes
    console.log('Recipes:', recipes);
    res.status(200).json(recipes);
});

// Get a recipe by ID
router.get('/:id', async (req, res) => {
    const recipeId = (req.params.id != undefined || req.params.id != null) ? req.params.id : 0;
    const recipe = await Recipe.findOne({ _id: recipeId }); // Find recipe by _id
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json(recipe);
});

// Delete a recipe by ID

router.delete('/:id', authMiddleware, async (req, res) => {
    const updateRecipe = await Recipe.findOneAndUpdate({ _id: req.params.id },
        {
            $set:
            {
                deleted_at: new Date()
            }
        });

    console.log(updateRecipe);
    if (!updateRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }
    else {
        res.status(200).json({ message: "Recipe deleted successfully" });
    }
});
