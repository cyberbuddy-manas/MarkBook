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
    console.log(`Server is up and running on ${PORT} ...`);
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

app.post('/user/signup', async (req, res) => {
    try {
        const { userID, name, email, password, myTags } = req.body;
        if (!userID || !name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await appUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new appUser({
            userID,
            name,
            email,
            password: hashedPassword,
            myTags
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
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

app.post('/user/token', async function (req, res) {
    const token = req.headers.authorization;

    if (!token) { return res.status(401).json({ error: 'Token is required' }); }

    const { email } = req.body;

    try {
        const user = await appUser.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.token == token.slice(7)) {
            return res.status(200).json({ message: 'Token is valid' });
        } else {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error retrieving user or comparing tokens:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
