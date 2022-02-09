const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const todoHandler = require("./routes/todoHandler");
const userHandler = require("./routes/userHandler");

// express app initialization
const app = express();
dotenv.config();
app.use(express.json());

// database connection with mongoose
mongoose.connect('mongodb://localhost/todos') 
    .then(() => console.log('Connection Successful'))
    .catch(err => console.log(err))


app.use('/todo', todoHandler);
app.use('/user', userHandler);


// default error handler
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json({ error: err });
}

app.use(errorHandler);

app.listen(3000, () => {
    console.log("App listening on port 3000");
})