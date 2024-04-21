const mongoose = require("mongoose");

const appUser = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    myTags: {
        type: Array,
        ref: 'appTag'
    },
    token: {
        type: String
    }
});

const AppUser = mongoose.model("appuser", appUser);
module.exports = AppUser;