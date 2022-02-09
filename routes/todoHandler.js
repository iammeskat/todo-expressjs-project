const express = require('express');
// const { route } = require('express/lib/application');
const mongoose = require("mongoose");
const router = express.Router();
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');
const TodoModel = new mongoose.model("Todo", todoSchema);
const UserModel = new mongoose.model("User", userSchema);
const checkLogin = require('../middlewares/checkLogin');

// Get all the todos
router.get('/', checkLogin, (req, res) => {
    // TodoModel.find({ status: 'active' }, (err, data) => {
    //     if (err) {
    //         res.status(500).json({
    //             error: 'There was a server side error!'
    //         })
    //     } else {
    //         res.status(200).json({
    //             result: data,
    //             message: 'Suceesfully retrived!'
    //         })
    //     }
    // }).clone();
    console.log(req.username);
    console.log(req.userId);

    TodoModel.find({ status: "active" })
        .populate("user", "name username -_id")
        .select({
            _id: 0,
            __v: 0,
            date: 0,
        })
        .limit(2)
        .exec((err, data) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error!'
                })
            } else {
                res.status(200).json({
                    result: data,
                    message: 'Suceesfully retrived!'
                })
            }
        })
})

// Get active todos
router.get('/active', async (req, res) => {
    const todo = new TodoModel();
    const data = await todo.findActive();
    res.status(200).json({
        data: data
    })
})

// get active todos with js
router.get('/js', async (req, res) => {
    const data = await TodoModel.findByJs();
    res.status(200).json({
        data,
    })
})

// get todos by language
router.get("/language", async (req, res) => {
    const data = await TodoModel.find().byLanguage("w3");
    res.status(200).json({
        data,
    })
})

// Get a todo by id
router.get('/:id', async (req, res) => {
    try {
        const data = await TodoModel.find({ _id: req.params.id });
        res.status(200).json({
            result: data,
            message: 'Suceesfully retrived!'
        })
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error!'
        })
    }
})

// Post a todo
router.post('/', checkLogin, async (req, res) => {
    const newTodo = new TodoModel({
        ...req.body,
        user: req.userId // from checklogin
    });

    try {
        const todo = await newTodo.save();
        await UserModel.updateOne({
            _id: req.userId
        }, {
            $push: {
                todos: todo._id
            }
        });

        res.status(200).json({
            message: 'Todo was inserted successfully!'
        })
    } catch {
        res.status(500).json({
            error: 'There was a server side error!'
        })
    }
})

// Post multiple todo
router.post('/all', (req, res) => {
    TodoModel.insertMany(req.body, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!'
            })
        } else {
            res.status(200).json({
                message: 'Todos were inserted successfully!'
            })
        }
    })
})

// put todo
router.put('/:id', (req, res) => {
    // TodoModel.updateOne(
    const result = TodoModel.findByIdAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                status: 'active'
            }
        },
        {
            new: true,
            useFindAndModify: false,
        },
        (err) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error!'
                })
            } else {
                res.status(200).json({
                    message: 'Todo was updated successfully!'
                });
            }
        }
    ).clone();
    console.log(result);
})

// delete todo
router.delete('/:id', (req, res) => {
    TodoModel.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!'
            })
        } else {
            res.status(200).json({
                message: 'Todo was deleted succesfully!'
            })
        }
    }).clone();
})


module.exports = router;
