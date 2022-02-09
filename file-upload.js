const express = require('express');
const multer = require('multer');
const path = require('path');

// File uploads folder
const UPLOADS_FOLDER = "./uploads";

// define the storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        // Important file.pdf
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-")+"-"+ Date.now();
        cb(null, fileName + fileExt);
    },
});

// prepare the final multer upload object
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000, // 1MB
    },
    fileFilter: (req, file, cb) => {
        if(
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only .jpg, .png, .jpeg format allowed"));
        }
    }
});

const app = express();

// application route
app.post('/', upload.single("avatar"), (req, res) => {
    res.send("File uploaded");
})

// default error handler
app.use((err, req, res, next) => {
    if(err){
        if (err instanceof multer.MulterError) {
            res.status(500).send("There was an upload error");
        } else {
            res.status(500).send(err.message);
        }
    } else {
        res.send("success");
    }
})

// app.use((err, req, res, next) => {
//     console.log(err);
//     res.status(500).send('There was an error!');
// });

app.listen(3000, () => {
    console.log("App listening on port 3000");
})