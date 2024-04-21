const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Global and Middlewares Configs
dotenv.config();
app.use(bodyParser.json());
app.use(cors());

//Models
let appTag = require('./models/appTag');
let appUser = require('./models/appUser');

//Mongo Connection
try {
    mongoose.connect(
        process.env.MONGODB_URL
    );
    console.log("connected to Mongo");
} catch (err) {
    console.log(err)
}

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is up and running on ${ PORT }`);
});

app.get("/", (req, res) => {
    res.send("Welcome to Cyberbuddy's Server!");
});

function generateToken(payload) {
    return new Promise((resolve, reject) => {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        jwt.sign(payload, jwtSecretKey, { expiresIn: "300s" }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

app.get('/user/getBookmarks', async (req, res) => {
    try {
        const { obj } = req.query;
        const token = req?.headers?.authorization?.split(' ')[1];
        if (!obj) {
            const bookmark = await appTag.find().exec();
            console.log(bookmark);
            res.status(200).json({
                "message": "Successfull",
                "data": bookmark,
                "isLogin": false,
                "status_code": 200
            })
        } else {
            if (!token) {
                return res.status(401).json({
                    status_code: 401,
                    data: "",
                    msg: 'Unauthorized - Token not provided'
                });
            }
            const getUser = appUser.find({ token: token });
            if (!getUser) {
                return res.status(401).json({
                    status_code: 401,
                    data: "",
                    msg: 'Invalid token'
                });
            }
            else {
                const bookmark = await appTag.find().exec();
                console.log(bookmark);
                res.status(200).json({
                    "message": "Successfull",
                    "data": bookmark,
                    "isLogin": true,
                    "status_code": 200
                })
            }
        }


    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/user/login", async (req, res) => {
    let login = req.body;
    let { email, password } = login;

    try {
        const existingUser = await appUser.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const userPayload = {
            id: existingUser._id,
            email: existingUser.email,
            password: existingUser.password,
            myTags: existingUser.myTags
        };

        var token = await generateToken(userPayload);

        await appUser.findOneAndUpdate({ email }, {
            token
        })

        res.send(token);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
});

app.post('/user/createBookmark', async function (req, res) {
    try {
        const token = req?.headers?.authorization?.split(' ')[1];
        const { title, tags, public } = req.body;
        console.log("Working");

        if (!token) {
            return res.status(401).json({
                status_code: 401,
                data: "",
                msg: 'Unauthorized - Token not provided'
            });
        }
        console.log("Working");

        const getUser = appUser.find({ token: token });
        if (!getUser) {
            return res.status(401).json({
                status_code: 401,
                data: "",
                msg: 'Invalid token'
            });
            console.log("Working");

        } else {


            if (!title || !tags || !public) {
                return res.status(400).json({ error: "Missing required fields" });
            } else {


                const newTag = new appTag({
                    appUser: getUser._id,
                    title,
                    author: getUser.name,
                    tags,
                    public,
                });
                console.log("Working");

                await newTag.save();
                return res.status(200).json({
                    "message": "Successfull",
                    "data": newTag,
                    "status_code": 200
                })
            }
        }
    } catch (error) {
        console.error('Error retrieving user or comparing tokens:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});