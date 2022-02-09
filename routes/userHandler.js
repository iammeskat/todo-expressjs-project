const express = require('express');
// const { route } = require('express/lib/application');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const UserModel = new mongoose.model("User", userSchema);

// Signup
router.post('/signup', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const newUser = new UserModel(req.body);
        await newUser.save();
        res.status(200).json({
            message: 'Signup successfull!'
        })
    } catch {
        res.status(500).json({
            error: 'Signup failed!'
        })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await UserModel.find({ username: req.body.username });
        if (user && user.length > 0) {
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);
            if (isValidPassword) {
                // generate token
                const token = jwt.sign({
                    username: user[0].username,
                    userId: user[0]._id,
                }, process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });

                res.status(200).json({
                    "access_token": token,
                    "message": 'Login successful!'
                })
            
            } else {
                res.status(401).json({
                    "error": "Authentication failed!"
                })
            }
        } else {
            res.status(401).json({
                "error": "Authentication failed!"
            })
        }
    } catch {
        res.status(401).json({
            "error": "Authentication failed!"
        })
    }
})

// All user
router.get('/all', async (req, res) => {
    try {
        const users = await UserModel.find({
            status: 'active'
        }).populate('todos');

        res.status(200).json({
            data: users,
            message: "Success!"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "There was a server side error!"
        })
    }
})
module.exports = router;
